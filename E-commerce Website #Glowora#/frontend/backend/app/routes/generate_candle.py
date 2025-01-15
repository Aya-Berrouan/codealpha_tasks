from diffusers import DiffusionPipeline
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import torch
import os
from datetime import datetime
from PIL import Image

router = APIRouter()

# Configure save directory
SAVE_DIR = "static/generated"
os.makedirs(SAVE_DIR, exist_ok=True)

# Initialize the model
pipe = DiffusionPipeline.from_pretrained("DeepFloyd/IF-I-M-v1.0")
if torch.cuda.is_available():
    pipe = pipe.to("cuda")

@router.post("/api/generate-candle")
async def generate_candle(request: dict):
    try:
        prompt = request.get("prompt")
        negative_prompt = request.get("negative_prompt", "")
        
        if not prompt:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Prompt is required"}
            )
        
        # Generate the image
        image = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=50
        ).images[0]
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"candle_{timestamp}.png"
        image_path = os.path.join(SAVE_DIR, filename)
        
        # Save the image
        image.save(image_path)
        
        # Return the image URL
        return JSONResponse(
            content={
                "success": True,
                "image_url": f"/static/generated/{filename}"
            }
        )
    
    except Exception as e:
        print(f"Error generating candle: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e)
            }
        ) 