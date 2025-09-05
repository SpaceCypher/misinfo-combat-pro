import functions_framework
import json
from google.cloud import workflows_v1
from google.cloud.workflows import executions_v1
from google.oauth2 import service_account
import os

@functions_framework.http
def analyze_proxy(request):
    """HTTP Cloud Function that proxies requests to the workflow."""
    
    # Set CORS headers for web requests
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    if request.method != 'POST':
        return ('Method not allowed', 405, headers)

    try:
        # Get request data
        request_json = request.get_json(silent=True)
        if not request_json:
            return (json.dumps({'error': 'No JSON data provided'}), 400, headers)

        # Initialize Workflows execution client
        execution_client = executions_v1.ExecutionsClient()

        # Define workflow details
        project_id = "optical-habitat-470918-f2"
        location = "asia-south1"
        workflow_id = "misinfo-analyzer-workflow"

        # Create execution
        parent = f"projects/{project_id}/locations/{location}/workflows/{workflow_id}"
        
        execution = {
            "argument": json.dumps({"body": request_json})
        }

        # Execute workflow
        response = execution_client.create_execution(
            parent=parent,
            execution=execution
        )

        # Wait for completion and get result
        execution_name = response.name
        
        # Poll for completion (simplified - in production, use async)
        import time
        max_wait = 60  # 60 seconds max
        wait_time = 0
        
        while wait_time < max_wait:
            execution_result = execution_client.get_execution(name=execution_name)
            if execution_result.state in [
                executions_v1.Execution.State.SUCCEEDED,
                executions_v1.Execution.State.FAILED,
                executions_v1.Execution.State.CANCELLED
            ]:
                break
            time.sleep(2)
            wait_time += 2

        if execution_result.state == executions_v1.Execution.State.SUCCEEDED:
            result = json.loads(execution_result.result) if execution_result.result else {}
            return (json.dumps(result), 200, headers)
        else:
            error_msg = execution_result.error or "Workflow execution failed"
            return (json.dumps({'error': str(error_msg)}), 500, headers)

    except Exception as e:
        return (json.dumps({'error': str(e)}), 500, headers)
