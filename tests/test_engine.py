import unittest
from verifier.engine import verify_run


class TestEngine(unittest.TestCase):

    def test_verified(self):
        data = {
            "claims": [{"claim_id": "c1", "action": "read_file", "target": "a.txt"}],
            "tool_events": [{"event_id": "e1", "action": "read_file", "target": "a.txt", "status": "success"}]
        }
        result = verify_run(data)
        self.assertEqual(result["results"][0]["status"], "VERIFIED")

    def test_unverified_when_log_incomplete(self):
        data = {
            "claims": [{"claim_id": "c2", "action": "read_file", "target": "b.txt"}],
            "tool_events": [],
            "expected_actions": [{"action": "read_file", "target": "b.txt"}],
            "logging_complete": False
        }
        result = verify_run(data)
        self.assertEqual(result["results"][0]["status"], "UNVERIFIED")

    def test_contradicted(self):
        data = {
            "claims": [{"claim_id": "c3", "action": "read_file", "target": "c.txt"}],
            "tool_events": [{"event_id": "e3", "action": "read_file", "target": "c.txt", "status": "failed"}]
        }
        result = verify_run(data)
        self.assertEqual(result["results"][0]["status"], "CONTRADICTED")


if __name__ == "__main__":
    unittest.main()
