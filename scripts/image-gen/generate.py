#!/usr/bin/env python3
"""
MujerApp — Generador de imágenes con Google Gemini Imagen
Uso: python3 scripts/image-gen/generate.py prompts/people/mi-prompt.json
"""

import sys
import json
import os
import base64
from pathlib import Path
from datetime import datetime

def load_env():
    """Carga .env.local si existe"""
    env_path = Path(__file__).parent.parent.parent / ".env.local"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, value = line.partition("=")
                    os.environ.setdefault(key.strip(), value.strip())

def build_full_prompt(prompt_data: dict) -> str:
    """Construye el prompt de texto completo desde el JSON estructurado"""
    p = prompt_data.get("prompt", {})

    parts = []

    if p.get("subject"):
        parts.append(p["subject"])
    if p.get("style"):
        parts.append(f"Style: {p['style']}")
    if p.get("mood"):
        parts.append(f"Mood: {p['mood']}")
    if p.get("lighting"):
        parts.append(f"Lighting: {p['lighting']}")
    if p.get("composition"):
        parts.append(f"Composition: {p['composition']}")
    if p.get("color_palette"):
        parts.append(f"Color palette: {p['color_palette']}")
    if p.get("details"):
        parts.append(f"Details: {p['details']}")

    full_prompt = ". ".join(parts)

    if p.get("negative"):
        full_prompt += f"\n\nDo not include: {p['negative']}"

    return full_prompt

def generate_image(prompt_file: str):
    load_env()

    # Leer el JSON del prompt
    prompt_path = Path(prompt_file)
    if not prompt_path.exists():
        print(f"Error: No se encontró el archivo {prompt_file}")
        sys.exit(1)

    with open(prompt_path) as f:
        prompt_data = json.load(f)

    # Validar campos requeridos
    required = ["category", "output_filename", "prompt"]
    for field in required:
        if field not in prompt_data:
            print(f"Error: Falta el campo '{field}' en el JSON")
            sys.exit(1)

    # Obtener API key
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: No se encontró GEMINI_API_KEY en .env.local")
        sys.exit(1)

    # Construir el prompt completo
    full_prompt = build_full_prompt(prompt_data)
    category = prompt_data["category"]
    output_filename = prompt_data["output_filename"]
    aspect_ratio = prompt_data.get("aspect_ratio", "1:1")

    print(f"\n Generando imagen...")
    print(f" Categoría: {category}")
    print(f" Archivo: {output_filename}")
    print(f" Proporción: {aspect_ratio}")
    print(f" Prompt: {full_prompt[:100]}...")

    # Llamada a la API de Gemini Imagen
    try:
        import urllib.request
        import urllib.error

        # Imagen 4 via predict endpoint (requiere plan de pago en Google AI Studio)
        # Alternativa: gemini-2.5-flash-image via generateContent (mismo requisito)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key={api_key}"

        payload = {
            "instances": [
                {"prompt": full_prompt}
            ],
            "parameters": {
                "sampleCount": 1,
                "aspectRatio": aspect_ratio,
                "personGeneration": "allow_adult",
                "safetySetting": "block_low_and_above",
                "includeRaiReason": True
            }
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode("utf-8"))

        # Extraer la imagen del response (formato predict de Imagen)
        predictions = result.get("predictions", [])
        if not predictions:
            print("Error: La API no devolvió ninguna imagen")
            print("Response:", json.dumps(result, indent=2))
            sys.exit(1)

        image_b64 = predictions[0].get("bytesBase64Encoded")
        if not image_b64:
            print("Error: No se encontró la imagen en el response")
            sys.exit(1)

        ext = "png"

        # Guardar la imagen
        output_dir = Path(__file__).parent.parent.parent / "images" / category
        output_dir.mkdir(parents=True, exist_ok=True)

        # Agregar timestamp para evitar sobreescribir
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        image_path = output_dir / f"{output_filename}-{timestamp}.{ext}"

        with open(image_path, "wb") as f:
            f.write(base64.b64decode(image_b64))

        # Guardar también el prompt JSON con el mismo timestamp
        prompts_dir = Path(__file__).parent.parent.parent / "prompts" / category
        prompts_dir.mkdir(parents=True, exist_ok=True)
        prompt_output_path = prompts_dir / f"{output_filename}-{timestamp}.json"

        # Agregar metadata al JSON guardado
        prompt_data["_metadata"] = {
            "generated_at": datetime.now().isoformat(),
            "image_path": str(image_path),
            "full_prompt_sent": full_prompt
        }

        with open(prompt_output_path, "w", encoding="utf-8") as f:
            json.dump(prompt_data, f, ensure_ascii=False, indent=2)

        print(f"\n Imagen generada exitosamente:")
        print(f"   Imagen:  {image_path}")
        print(f"   Prompt:  {prompt_output_path}")

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"Error HTTP {e.code}: {e.reason}")
        print("Detalle:", error_body)
        sys.exit(1)
    except Exception as e:
        print(f"Error inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso: python3 scripts/image-gen/generate.py <path-al-json>")
        print("Ejemplo: python3 scripts/image-gen/generate.py prompts/people/estilista-01.json")
        sys.exit(1)

    generate_image(sys.argv[1])
