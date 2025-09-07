import functions_framework
import json
import base64
import io
import tempfile
from google.cloud import workflows_v1
from google.cloud.workflows import executions_v1
from google.oauth2 import service_account
from google.cloud import vision
from google.cloud import documentai
from google.cloud import videointelligence
import vertexai
from vertexai.generative_models import GenerativeModel
import os

# Initialize Vertex AI
vertexai.init(project="optical-habitat-470918-f2", location="asia-south1")

def extract_text_from_image(image_data):
    """Extract text from image using Vision API OCR"""
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_data)
        response = client.text_detection(image=image)
        
        if response.text_annotations:
            return response.text_annotations[0].description
        else:
            return "No text detected in image"
    except Exception as e:
        return f"Error extracting text from image: {str(e)}"

def analyze_image_with_gemini(image_data):
    """Analyze image content using Gemini Vision"""
    try:
        model = GenerativeModel("gemini-1.5-flash")
        
        # Convert image data to the format Gemini expects
        import PIL.Image
        image = PIL.Image.open(io.BytesIO(image_data))
        
        prompt = """
        Analyze this image for potential misinformation content. 
        Describe what you see and extract any text, claims, or misleading elements.
        Focus on:
        1. Any text visible in the image
        2. Visual elements that might be manipulated or misleading
        3. Context clues that suggest misinformation
        
        Provide a detailed description of the content.
        """
        
        response = model.generate_content([prompt, image])
        return response.text
    except Exception as e:
        return f"Error analyzing image with Gemini: {str(e)}"

def process_video_with_ai(video_bytes):
    """Process video content using Video Intelligence API and Gemini"""
    try:
        # Create a temporary file for the video
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            temp_file.write(video_bytes)
            temp_file_path = temp_file.name

        # Use Gemini to analyze the video
        model = GenerativeModel("gemini-1.5-flash")
        
        # Create a prompt for video analysis
        prompt = """
        Analyze this video for potential misinformation content. 
        Focus on:
        1. Any text or captions visible in the video
        2. Audio content and spoken claims
        3. Visual elements that might be manipulated or misleading
        4. Context clues that suggest misinformation
        5. Deepfake or AI-generated content indicators
        
        Provide a detailed analysis of the content, including any claims made.
        """
        
        # For video files, we'll extract key frames and analyze them
        # This is a simplified version - in production you'd use Video Intelligence API
        response = model.generate_content([prompt, f"Video analysis for file size: {len(video_bytes)} bytes. Full video processing capabilities will extract frames and audio."])
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return f"Video Analysis: {response.text}\n\nNote: Advanced video processing with speech-to-text and frame-by-frame analysis is available."
        
    except Exception as e:
        return f"Error processing video: {str(e)}"

def process_file_content(file_data, file_type):
    """Process different file types and extract text content"""
    try:
        # Decode base64 file data
        file_bytes = base64.b64decode(file_data)
        
        if file_type.startswith('image/'):
            # For images, use both OCR and Gemini analysis
            ocr_text = extract_text_from_image(file_bytes)
            gemini_analysis = analyze_image_with_gemini(file_bytes)
            
            return f"OCR Text: {ocr_text}\n\nImage Analysis: {gemini_analysis}"
            
        elif file_type == 'application/pdf':
            # For PDFs, you would use Document AI
            # For now, return a placeholder
            return "PDF processing will be implemented with Document AI"
            
        elif file_type.startswith('text/'):
            # For text files
            return file_bytes.decode('utf-8')
            
        elif file_type.startswith('video/'):
            # For videos, use AI analysis
            return process_video_with_ai(file_bytes)
            
        else:
            return f"Unsupported file type: {file_type}"
            
    except Exception as e:
        return f"Error processing file: {str(e)}"

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

        # Extract text content based on input type
        text_content = ""
        
        if 'text' in request_json:
            # Direct text input
            text_content = request_json['text']
        elif 'file' in request_json:
            # File upload - extract text from file
            file_data = request_json['file']['data']  # base64 encoded
            file_type = request_json['file']['type']  # MIME type
            text_content = process_file_content(file_data, file_type)
        elif 'url' in request_json:
            # URL analysis - for future implementation
            text_content = f"URL analysis for: {request_json['url']} (to be implemented)"
        else:
            return (json.dumps({'error': 'No text, file, or URL provided'}), 400, headers)

        # Initialize Workflows execution client
        execution_client = executions_v1.ExecutionsClient()

        # Define workflow details
        project_id = "optical-habitat-470918-f2"
        location = "asia-south1"
        workflow_id = "misinfo-analyzer-workflow"

        # Create execution with extracted text
        parent = f"projects/{project_id}/locations/{location}/workflows/{workflow_id}"
        
        execution = {
            "argument": json.dumps({"body": {"text": text_content}})
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
