"""Independent unit tests for PromiseLedger AI Claim Extractor (Owner: Rishav).

Covers:
- Single and multiple explicit action claims
- Vague claims (returns empty claims; blocks invented actions)
- Missing/unspecified targets (preserves aggregate/unspecified target without inventing filenames)
- Malformed model responses (invalid JSON, missing fields, invalid types/confidence)
- Unavailable model APIs (missing key, connection refused, timeout -> labeled fallback)
- Strict separation of concerns (rejects verdicts and tool_events)
"""

from __future__ import annotations

import json
import os
import sys
import unittest
import urllib.error
from typing import Any, Dict

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.claim_extractor import (
    DEMO_PAYLOAD,
    ClaimExtractor,
    ClaimValidationError,
    extract_claims,
    extract_claims_strict,
    validate_claims_payload,
)


class TestClaimExtractor(unittest.TestCase):
    def test_case_1_single_action(self) -> None:
        """1. Single action: 'I read file1.txt.' -> read_file claim targeting file1.txt."""
        res = extract_claims("I read file1.txt.", force_fallback=True)
        self.assertEqual(len(res["claims"]), 1)
        self.assertEqual(res["claims"][0]["action"], "read_file")
        self.assertEqual(res["claims"][0]["target"], "file1.txt")

    def test_case_2_multiple_actions_with_then(self) -> None:
        """2. Multiple actions: 'I read file1.txt and file2.txt, then generated report.md.'
        -> two file-read claims and one report-generation claim.
        """
        res = extract_claims(
            "I read file1.txt and file2.txt, then generated report.md.",
            force_fallback=True,
        )
        self.assertEqual(
            [(c["action"], c["target"]) for c in res["claims"]],
            [
                ("read_file", "file1.txt"),
                ("read_file", "file2.txt"),
                ("generate_report", "report.md"),
            ],
        )

    def test_case_3_unspecified_targets(self) -> None:
        """3. Unspecified targets: 'I checked all five files.'
        -> Preserve aggregate claim without inventing filenames.
        """
        res = extract_claims("I checked all five files.", force_fallback=True)
        self.assertEqual(len(res["claims"]), 1)
        self.assertEqual(res["claims"][0]["action"], "read_file")
        self.assertEqual(res["claims"][0]["target"], "all_5_files")

    def test_case_4_empty_statement(self) -> None:
        """4. Empty statement: '' -> Return valid empty result."""
        res = extract_claims("")
        self.assertEqual(res["claims"], [])

    def test_case_5_model_unavailable_report(self) -> None:
        """5. Model unavailable: 'I generated report.md.' -> Clearly identified fallback."""

        def unavailable_client(
            url: str, headers: Dict[str, str], body: Dict[str, Any], timeout: float
        ) -> str:
            raise urllib.error.URLError("Connection refused")

        extractor = ClaimExtractor(api_key="test-key", http_client=unavailable_client)
        res = extractor.extract("I generated report.md.")
        self.assertTrue(res["extraction_meta"]["is_fallback"])
        self.assertEqual(res["extraction_meta"]["source"], "deterministic_fallback")
        self.assertEqual(len(res["claims"]), 1)
        self.assertEqual(res["claims"][0]["action"], "generate_report")
        self.assertEqual(res["claims"][0]["target"], "report.md")

    def test_vague_claims_do_not_invent_actions_or_filenames(self) -> None:
        """Vague statements with no checkable tool actions return empty claims and
        reject any model attempt to invent actions or filenames.
        """
        vague_statements = [
            "Everything is done and looks great.",
            "I finished the task successfully.",
            "The workflow completed without issues.",
        ]
        for stmt in vague_statements:
            res = extract_claims(stmt, force_fallback=True)
            self.assertEqual(res["claims"], [])

        # If a faulty model tries to invent a claim on a vague statement, validator rejects it
        with self.assertRaises(ClaimValidationError):
            validate_claims_payload(
                {
                    "claims": [
                        {
                            "claim_id": "c1",
                            "action": "read_file",
                            "target": "all_files",
                            "source_text": "Everything is done",
                            "confidence": 0.8,
                        }
                    ]
                },
                agent_statement="Everything is done and looks great.",
                expected_actions=None,
            )

    def test_missing_targets_preserved_without_inventing_filenames(self) -> None:
        """Missing targets in singular or plural statements never invent filenames."""
        res_singular = extract_claims("I read the file.", force_fallback=True)
        self.assertEqual(len(res_singular["claims"]), 1)
        self.assertEqual(res_singular["claims"][0]["action"], "read_file")
        self.assertEqual(res_singular["claims"][0]["target"], "unspecified_file")

        res_plural = extract_claims("I inspected the files.", force_fallback=True)
        self.assertEqual(len(res_plural["claims"]), 1)
        self.assertEqual(res_plural["claims"][0]["action"], "read_file")
        self.assertEqual(res_plural["claims"][0]["target"], "all_files")

    def test_demo_five_files_and_report_with_expected_actions(self) -> None:
        """Statement 'I inspected all five files and generated the report.' with expected_actions
        must yield 5 atomic read_file claims (file1.txt..file5.txt) and 1 generate_report claim.
        """
        result = extract_claims(DEMO_PAYLOAD, force_fallback=True)
        self.assertIn("claims", result)
        claims = result["claims"]
        self.assertEqual(len(claims), 6)

        read_targets = [c["target"] for c in claims if c["action"] == "read_file"]
        self.assertEqual(
            read_targets,
            ["file1.txt", "file2.txt", "file3.txt", "file4.txt", "file5.txt"],
        )

        report_claims = [c for c in claims if c["action"] == "generate_report"]
        self.assertEqual(len(report_claims), 1)
        self.assertEqual(report_claims[0]["target"], "report.md")

        for claim in claims:
            self.assertEqual(
                set(claim.keys()),
                {"claim_id", "action", "target", "source_text", "confidence"},
            )
            self.assertIsInstance(claim["claim_id"], str)
            self.assertIsInstance(claim["action"], str)
            self.assertIsInstance(claim["target"], str)
            self.assertIsInstance(claim["source_text"], str)
            self.assertIsInstance(claim["confidence"], float)
            self.assertGreaterEqual(claim["confidence"], 0.0)
            self.assertLessEqual(claim["confidence"], 1.0)

    def test_group_claim_without_filenames_does_not_invent_filenames(self) -> None:
        """If individual filenames are unavailable, represent the aggregate claim explicitly."""
        statement = "I read all five files and generated report.md"
        result = extract_claims(statement, expected_actions=None, force_fallback=True)
        claims = result["claims"]
        self.assertEqual(len(claims), 2)
        self.assertEqual(claims[0]["action"], "read_file")
        self.assertEqual(claims[0]["target"], "all_5_files")
        self.assertEqual(claims[1]["action"], "generate_report")
        self.assertEqual(claims[1]["target"], "report.md")

    def test_validator_rejects_any_invented_filename_from_model(self) -> None:
        """If the LLM hallucinates any filename ('file1.txt', 'secret.csv', etc.) not in
        statement or expected_actions, validation rejects it.
        """
        for invented_name in ("file1.txt", "secret_data.csv", "config.yaml"):
            hallucinated_payload = {
                "claims": [
                    {
                        "claim_id": "c1",
                        "action": "read_file",
                        "target": invented_name,
                        "source_text": "I read all five files",
                        "confidence": 0.9,
                    }
                ]
            }
            with self.assertRaises(ClaimValidationError):
                validate_claims_payload(
                    hallucinated_payload,
                    agent_statement="I read all five files and generated report.md",
                    expected_actions=None,
                )

    def test_multiple_explicit_claims_in_statement(self) -> None:
        """Explicitly named files in the statement are extracted into atomic claims."""
        statement = "I read alpha.txt, beta.json, and gamma.py and created final_report.md."
        result = extract_claims(statement, force_fallback=True)
        claims = result["claims"]
        self.assertEqual(len(claims), 4)
        self.assertEqual(
            [(c["action"], c["target"]) for c in claims],
            [
                ("read_file", "alpha.txt"),
                ("read_file", "beta.json"),
                ("read_file", "gamma.py"),
                ("generate_report", "final_report.md"),
            ],
        )

    def test_valid_open_weight_model_response(self) -> None:
        """When the open-weight model returns valid JSON, extraction_meta marks source='open_weight_model'."""
        mock_llm_claims = {
            "claims": [
                {
                    "claim_id": "c1",
                    "action": "read_file",
                    "target": "file1.txt",
                    "source_text": "I read file1.txt",
                    "confidence": 0.95,
                }
            ]
        }

        def fake_http_client(
            url: str, headers: Dict[str, str], body: Dict[str, Any], timeout: float
        ) -> str:
            return json.dumps(
                {
                    "choices": [
                        {
                            "message": {
                                "content": "```json\n" + json.dumps(mock_llm_claims) + "\n```"
                            }
                        }
                    ]
                }
            )

        extractor = ClaimExtractor(
            api_key="test-key",
            model_name="meta-llama/Llama-3.3-70B-Instruct",
            http_client=fake_http_client,
        )
        res = extractor.extract("I read file1.txt")
        self.assertEqual(len(res["claims"]), 1)
        self.assertEqual(res["claims"][0]["target"], "file1.txt")
        self.assertFalse(res["extraction_meta"]["is_fallback"])
        self.assertEqual(res["extraction_meta"]["source"], "open_weight_model")
        self.assertEqual(
            res["extraction_meta"]["model"], "meta-llama/Llama-3.3-70B-Instruct"
        )
        self.assertFalse(res["extraction_meta"]["trained_or_finetuned"])

    def test_malformed_model_output_triggers_labeled_fallback(self) -> None:
        """Malformed JSON, missing fields, or invalid confidence from model triggers labeled fallback."""

        def broken_json_client(
            url: str, headers: Dict[str, str], body: Dict[str, Any], timeout: float
        ) -> str:
            return json.dumps(
                {"choices": [{"message": {"content": "{not_valid_json: true"}}]}
            )

        extractor = ClaimExtractor(api_key="test-key", http_client=broken_json_client)
        res = extractor.extract("I read file1.txt and generated report.md")
        self.assertTrue(res["extraction_meta"]["is_fallback"])
        self.assertEqual(res["extraction_meta"]["source"], "deterministic_fallback")
        self.assertIn("Malformed JSON", res["extraction_meta"]["fallback_reason"])
        self.assertEqual(len(res["claims"]), 2)

        # Also test missing target field & out-of-bounds confidence
        with self.assertRaises(ClaimValidationError):
            validate_claims_payload(
                {"claims": [{"claim_id": "c1", "action": "read_file", "confidence": 0.9}]}
            )
        with self.assertRaises(ClaimValidationError):
            validate_claims_payload(
                {
                    "claims": [
                        {
                            "claim_id": "c1",
                            "action": "read_file",
                            "target": "file1.txt",
                            "source_text": "I read file1.txt",
                            "confidence": 1.5,
                        }
                    ]
                }
            )

    def test_model_unavailability_and_timeout_triggers_fallback(self) -> None:
        """Timeout or missing API key gracefully falls back and labels fallback."""

        def timeout_client(
            url: str, headers: Dict[str, str], body: Dict[str, Any], timeout: float
        ) -> str:
            raise TimeoutError("Inference endpoint timed out after 8.0s")

        extractor = ClaimExtractor(api_key="test-key", http_client=timeout_client)
        res = extractor.extract(DEMO_PAYLOAD)
        self.assertTrue(res["extraction_meta"]["is_fallback"])
        self.assertEqual(res["extraction_meta"]["source"], "deterministic_fallback")
        self.assertIn("TimeoutError", res["extraction_meta"]["fallback_reason"])
        self.assertEqual(len(res["claims"]), 6)

    def test_empty_and_whitespace_input(self) -> None:
        """Empty or whitespace-only input returns empty claims list."""
        for empty_stmt in ("", "   ", "\n\t"):
            res = extract_claims(empty_stmt)
            self.assertEqual(res["claims"], [])
            self.assertFalse(res["extraction_meta"]["is_fallback"])

    def test_never_allows_verdicts_or_tool_events(self) -> None:
        """Validator rejects any payload containing verdicts or tool_events."""
        with self.assertRaises(ClaimValidationError):
            validate_claims_payload(
                {
                    "claims": [
                        {
                            "claim_id": "c1",
                            "action": "read_file",
                            "target": "file1.txt",
                            "source_text": "I read file1.txt",
                            "confidence": 0.95,
                            "status": "VERIFIED",
                        }
                    ]
                }
            )

        with self.assertRaises(ClaimValidationError):
            validate_claims_payload({"claims": [], "tool_events": []})

    def test_strict_contract_helper(self) -> None:
        """extract_claims_strict returns only the {'claims': [...]} key."""
        strict_res = extract_claims_strict("I read file1.txt", force_fallback=True)
        self.assertEqual(list(strict_res.keys()), ["claims"])
        self.assertEqual(len(strict_res["claims"]), 1)


if __name__ == "__main__":
    unittest.main()
