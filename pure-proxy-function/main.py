import functions_framework
import json
import requests
from flask import jsonify

@functions_framework.http
def pure_proxy(request):
    """
    Proxy function for the pure API agent - simpler workflow
    """
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return ('', 204, headers)
    
    headers = {'Access-Control-Allow-Origin': '*'}
    
    try:
        request_json = request.get_json()
        
        if not request_json:
            return jsonify({'error': 'No JSON data provided'}), 400, headers
        
        # Extract text from different input types
        text_content = None
        
        if 'text' in request_json:
            text_content = request_json['text']
        elif 'url' in request_json:
            # For URL analysis, we'll extract a sample for now
            url = request_json['url']
            text_content = f"Please analyze this URL for misinformation: {url}"
        elif 'file' in request_json:
            # For file analysis, we'll use the filename as context
            file_info = request_json['file']
            text_content = f"Please analyze this uploaded file for misinformation: {file_info.get('name', 'unknown file')}"
        
        if not text_content:
            return jsonify({'error': 'No valid content provided for analysis'}), 400, headers
        
        # Call the pure API agent
        pure_api_url = 'https://us-central1-optical-habitat-470918-f2.cloudfunctions.net/pure-api-agent'
        
        response = requests.post(
            pure_api_url,
            json={'claim': text_content},
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        if not response.ok:
            return jsonify({
                'error': f'Pure API agent failed: {response.status_code}',
                'details': response.text
            }), 500, headers
        
        result = response.json()
        
        # Transform the result to match the expected frontend format
        transformed_result = {
            'risk_score': 100 - result.get('credibility_score', 50),  # Invert credibility to risk
            'summary_title': get_risk_title(100 - result.get('credibility_score', 50)),
            'explanation_html': format_explanation_html(result),
            'method': 'pure_vertex_ai_api',
            'model': result.get('model', 'gemini-2.5-flash')
        }
        
        return jsonify(transformed_result), 200, headers
        
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Analysis timed out. Please try again.'}), 504, headers
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Network error: {str(e)}'}), 503, headers
    except Exception as e:
        return jsonify({'error': f'Internal error: {str(e)}'}), 500, headers

def get_risk_title(risk_score):
    """Generate risk title based on score"""
    if risk_score <= 15:
        return "Very Low Risk: Highly Credible Content"
    elif risk_score <= 30:
        return "Low Risk: Generally Reliable"
    elif risk_score <= 50:
        return "Moderate Risk: Some Concerns Detected"
    elif risk_score <= 70:
        return "High Risk: Significant Issues Found"
    else:
        return "Very High Risk: Potentially Misleading"

def format_explanation_html(result):
    """Format the API result into HTML for the frontend"""
    explanation = result.get('explanation', 'No explanation provided')
    confidence = result.get('confidence', 'unknown')
    credibility_score = result.get('credibility_score', 50)
    key_points = result.get('key_points', [])
    
    # Clean up explanation if it contains JSON
    if explanation.startswith('```json'):
        # Extract the actual explanation from embedded JSON
        try:
            import re
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', explanation, re.DOTALL)
            if json_match:
                embedded_data = json.loads(json_match.group(1))
                explanation = embedded_data.get('explanation', explanation)
                if not key_points:
                    key_points = embedded_data.get('key_points', [])
        except:
            # If parsing fails, use original explanation
            explanation = explanation.replace('```json', '').replace('```', '')
    
    # Format as HTML
    html_parts = []
    
    # Add credibility assessment
    html_parts.append(f'<div class="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">')
    html_parts.append(f'<h4 class="font-semibold text-blue-900 mb-2">Credibility Assessment</h4>')
    html_parts.append(f'<p class="text-blue-800">Credibility Score: <strong>{credibility_score}%</strong></p>')
    html_parts.append(f'<p class="text-blue-800">Confidence Level: <strong>{confidence.title()}</strong></p>')
    html_parts.append(f'</div>')
    
    # Add main explanation
    html_parts.append(f'<div class="mb-4">')
    html_parts.append(f'<h4 class="font-semibold text-gray-900 mb-2">Analysis Details</h4>')
    
    # Split explanation into paragraphs
    paragraphs = explanation.split('\n\n')
    for para in paragraphs:
        if para.strip():
            html_parts.append(f'<p class="mb-3 text-gray-700">{para.strip()}</p>')
    
    html_parts.append(f'</div>')
    
    # Add key points if available
    if key_points and isinstance(key_points, list) and len(key_points) > 0:
        html_parts.append(f'<div class="mb-4">')
        html_parts.append(f'<h4 class="font-semibold text-gray-900 mb-2">Key Points</h4>')
        html_parts.append(f'<ul class="list-disc pl-5 space-y-1">')
        for point in key_points:
            if isinstance(point, str) and point.strip():
                html_parts.append(f'<li class="text-gray-700">{point.strip()}</li>')
        html_parts.append(f'</ul>')
        html_parts.append(f'</div>')
    
    # Add methodology note
    html_parts.append(f'<div class="mt-4 p-3 bg-gray-50 rounded border">')
    html_parts.append(f'<p class="text-sm text-gray-600"><strong>Analysis Method:</strong> This assessment was generated using Gemini 2.5 Flash AI model, evaluating the content against known patterns of misinformation and factual accuracy.</p>')
    html_parts.append(f'</div>')
    
    return ''.join(html_parts)
