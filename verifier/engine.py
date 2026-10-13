def verify_run(run_data: dict) -> dict:
    claims = run_data.get("claims", [])
    events = run_data.get("tool_events", [])
    expected = run_data.get("expected_actions", [])
    logging_complete = run_data.get("logging_complete", False)

    results = []

    for claim in claims:
        action = claim.get("action")
        target = claim.get("target")

        # Match exact action and target.
        matching = [
            event for event in events
            if event.get("action") == action
            and event.get("target") == target
        ]

        # Evidence contains full event details, not just IDs.
        evidence = [
            {
                "event_id": event.get("event_id"),
                "action": event.get("action"),
                "target": event.get("target"),
                "status": event.get("status"),
                "details": event.get("details", {})
            }
            for event in matching
            if event.get("event_id")
        ]

        malformed = any(
            not event.get("event_id")
            or event.get("status") not in ("success", "failed")
            for event in matching
        )

        successful = [
            event for event in matching
            if event.get("status") == "success"
        ]
        failed = [
            event for event in matching
            if event.get("status") == "failed"
        ]

        if malformed:
            status = "UNVERIFIED"
            reason_code = "AMBIGUOUS_EVIDENCE"
            explanation = "A matching event has a missing ID or unknown outcome."

        elif successful and failed:
            status = "UNVERIFIED"
            reason_code = "CONFLICTING_EVENTS"
            explanation = "Matching events contain both success and failure outcomes."

        elif successful:
            status = "VERIFIED"
            reason_code = "SUCCESS_EVIDENCE"
            explanation = "A successful matching tool event supports this claim."

        elif failed:
            status = "CONTRADICTED"
            reason_code = "EXPLICIT_FAILURE"
            explanation = "The matching tool event records a failed action."

        else:
            action_expected = any(
                item.get("action") == action
                and item.get("target") == target
                for item in expected
            )

            if logging_complete is True and action_expected:
                status = "CONTRADICTED"
                reason_code = "EXPECTED_ACTION_MISSING"
                explanation = (
                    "The log is complete, but an expected action "
                    "has no matching event."
                )
            else:
                status = "UNVERIFIED"
                reason_code = "INSUFFICIENT_EVIDENCE"
                explanation = (
                    "No matching event was found, and available logs "
                    "cannot establish whether the action occurred."
                )

        results.append({
            "claim_id": claim.get("claim_id", "unknown"),
            "status": status,
            "evidence": evidence,
            "reason_code": reason_code,
            "explanation": explanation
        })

    summary = {
        "total": len(results),
        "verified": sum(r["status"] == "VERIFIED" for r in results),
        "contradicted": sum(r["status"] == "CONTRADICTED" for r in results),
        "unverified": sum(r["status"] == "UNVERIFIED" for r in results)
    }

    return {
        "run_id": run_data.get("run_id", "unknown"),
        "results": results,
        "summary": summary
    }
