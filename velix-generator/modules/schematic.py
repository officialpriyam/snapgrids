"""
Schematic generation module — uses the 5-stage pipeline.

Pipeline: Blueprint → Structure → Detailing → Validation → Export
LLM only picks parameters; all geometry is deterministic code.
"""

import uuid
import os
import time
import logging

from pipeline.orchestrator import run_pipeline

logger = logging.getLogger(__name__)


def generate_schematic(prompt, size=48, mode='generate', output_dir='output', seed=None):
    """Generate a schematic file from a natural language prompt.

    Args:
        prompt: Natural language build request
        size: Maximum size (unused, kept for compatibility)
        mode: 'generate' or 'quick' (quick uses hardcoded blueprint)
        output_dir: Directory to write the .schem file
        seed: Optional seed for reproducibility

    Returns:
        Dict with file info for the API response
    """
    file_id = str(uuid.uuid4())[:12]
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f'schematic_{file_id}.schem')

    logger.info(f'[SchematicGen] Generating: {prompt}')

    result = run_pipeline(
        user_request=prompt,
        output_path=output_path,
        seed=seed,
        determinism=True,
    )

    if not result.get('success'):
        logger.error(f'[SchematicGen] Pipeline failed: {result.get("error")}')
        raise RuntimeError(f'Schematic generation failed: {result.get("error")}')

    export_info = result.get('export_info', {})
    telemetry = result.get('telemetry', {})

    logger.info(f'[SchematicGen] Complete — {export_info.get("block_count", 0)} blocks, '
                f'{export_info.get("file_size_bytes", 0)} bytes')

    return {
        'file': f'schematic_{file_id}.schem',
        'download_url': f'/download/schematic_{file_id}.schem',
        'preview_url': f'/preview/schematic_{file_id}.schem',
        'block_count': export_info.get('block_count', 0),
        'size': [
            export_info.get('width', 0),
            export_info.get('height', 0),
            export_info.get('length', 0),
        ],
        'mode': mode,
        'telemetry': telemetry,
    }
