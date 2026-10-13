import unittest
from verifier.engine import verify_run


def make_input(events=None, complete=False, expected=None, target="a.txt"):
    return {
        "run_id": "test_run",
        "logging_complete": complete,
        "claims": [{
            "claim_id": "c1",
            "action": "read_file",
            "target": target
        }],
        "expected_actions": expected or [],
        "tool_events": events or []
    }


def event(event_id="e1", target="a.txt", status="success"):
    return {
        "event_id": event_id,
        "action": "read_file",
        "target": target,
        "status": status,
        "details": {"path": target}
    }


class TestEngine(unittest.TestCase):

    def verdict(self, data):
        return verify_run(data)["results"][0]["status"]

    def test_success(self):
        result = verify_run(make_input(events=[event()]))
        self.assertEqual(result["results"][0]["status"], "VERIFIED")
        self.assertEqual(result["results"][0]["evidence"][0]["event_id"], "e1")

    def test_incomplete_log(self):
        data = make_input(expected=[{"action": "read_file", "target": "a.txt"}])
        self.assertEqual(self.verdict(data), "UNVERIFIED")

    def test_missing_expected_action_in_complete_log(self):
        data = make_input(
            complete=True,
            expected=[{"action": "read_file", "target": "a.txt"}]
        )
        self.assertEqual(self.verdict(data), "CONTRADICTED")

    def test_explicit_failure(self):
        self.assertEqual(
            self.verdict(make_input(events=[event(status="failed")])),
            "CONTRADICTED"
        )

    def test_duplicate_success(self):
        result = verify_run(make_input(events=[event("e1"), event("e2")]))
        self.assertEqual(result["results"][0]["status"], "VERIFIED")
        self.assertEqual(len(result["results"][0]["evidence"]), 2)

    def test_conflicting_events(self):
        data = make_input(events=[
            event("e1", status="success"),
            event("e2", status="failed")
        ])
        self.assertEqual(self.verdict(data), "UNVERIFIED")

    def test_mismatched_target(self):
        data = make_input(
            events=[event(target="other.txt")],
            complete=True,
            expected=[{"action": "read_file", "target": "a.txt"}]
        )
        result = verify_run(data)["results"][0]
        self.assertEqual(result["status"], "CONTRADICTED")
        self.assertEqual(result["evidence"], [])

    def test_ambiguous_outcome(self):
        self.assertEqual(
            self.verdict(make_input(events=[event(status="unknown")])),
            "UNVERIFIED"
        )

    def test_missing_event_id(self):
        data = make_input(events=[{
            "action": "read_file",
            "target": "a.txt",
            "status": "success"
        }])
        self.assertEqual(self.verdict(data), "UNVERIFIED")


if __name__ == "__main__":
    unittest.main()
