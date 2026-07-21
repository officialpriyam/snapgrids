"""
Pipeline Orchestrator — wires Stages 1-5 together.
"""

import logging
import time
from typing import Dict, Any

from .stage1_blueprint import generate_blueprint
from .stage2_structure import generate_structure
from .stage3_detailing import generate_details, apply_details
from .stage4_validation import validate_and_repair
from .stage5_export import export_schematic
from .primitives import block_count, block_count_by_type

logger = logging.getLogger(__name__)


def run_pipeline(user_request: str,
                 output_path: str,
                 seed: int | None = None,
                 determinism: bool = True) -> Dict[str, Any]:
    """Run the full 5-stage generation pipeline.

    Args:
        user_request: Natural language build request
        output_path: Where to write the .schem file
        seed: Optional seed for reproducibility
        determinism: If True, fix random seeds for reproducibility

    Returns:
        Dict with telemetry and result info
    """
    start = time.time()
    result = {
        "user_request": user_request,
        "output_path": output_path,
        "stages": {},
        "success": False,
        "error": None,
    }

    try:
        # Stage 1: Blueprint (LLM)
        t1 = time.time()
        blueprint = generate_blueprint(user_request, seed)
        result["stages"]["blueprint"] = {
            "time_ms": int((time.time() - t1) * 1000),
            "blocks": 0,
            "blueprint": blueprint,
        }
        logger.info(f"Pipeline: Stage 1 complete in {result['stages']['blueprint']['time_ms']}ms")

        # Stage 2: Structure (pure code)
        t2 = time.time()
        grid = generate_structure(blueprint)
        block_count_val = block_count(grid)
        result["stages"]["structure"] = {
            "time_ms": int((time.time() - t2) * 1000),
            "blocks": block_count_val,
        }
        logger.info(f"Pipeline: Stage 2 complete in {result['stages']['structure']['time_ms']}ms — {block_count_val} blocks")

        # Stage 3: Detailing (LLM)
        t3 = time.time()
        detail_plan = generate_details(blueprint, grid, seed)
        apply_details(grid, blueprint, detail_plan)
        detail_blocks = block_count(grid)
        result["stages"]["detailing"] = {
            "time_ms": int((time.time() - t3) * 1000),
            "blocks_before": block_count_val,
            "blocks_after": detail_blocks,
        }
        logger.info(f"Pipeline: Stage 3 complete in {result['stages']['detailing']['time_ms']}ms — {detail_blocks} blocks after detailing")

        # Stage 4: Validation & Repair (pure code)
        t4 = time.time()
        repair_stats = validate_and_repair(grid, blueprint)
        final_blocks = block_count(grid)
        result["stages"]["validation"] = {
            "time_ms": int((time.time() - t4) * 1000),
            "blocks_after": final_blocks,
            "repair_stats": repair_stats,
        }
        logger.info(f"Pipeline: Stage 4 complete in {result['stages']['validation']['time_ms']}ms — {final_blocks} blocks after repair")

        # Stage 5: Export (pure code)
        t5 = time.time()
        export_info = export_schematic(grid, blueprint, output_path)
        result["stages"]["export"] = {
            "time_ms": int((time.time() - t5) * 1000),
            "export_info": export_info,
        }
        logger.info(f"Pipeline: Stage 5 complete in {result['stages']['export']['time_ms']}ms — {export_info['file_size_bytes']} bytes")

        result["success"] = True
        result["blueprint"] = blueprint
        result["detail_plan"] = detail_plan
        result["export_info"] = export_info
        result["telemetry"] = {
            "total_time_ms": int((time.time() - start) * 1000),
            "blueprint": blueprint,
            "detail_plan": detail_plan,
            "repair_stats": repair_stats,
            "block_count": final_blocks,
        }

        logger.info(f"Pipeline: Complete in {result['telemetry']['total_time_ms']}ms — {final_blocks} blocks total")

    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        result["error"] = str(e)
        result["success"] = False

    return result


def run_pipeline_quick(user_request: str, output_path: str) -> Dict[str, Any]:
    """Quick pipeline run without LLM calls (for testing).

    Uses hardcoded blueprint values.
    """
    from .stage1_blueprint import validate_blueprint

    # Hardcoded test blueprint
    blueprint = validate_blueprint({
        "name": "test_build",
        "style": "medieval_stone",
        "shape": "rectangular",
        "footprint": {"width": 10, "depth": 8, "wings": 0},
        "floors": {"count": 2, "floor_height": 4},
        "roof": {"type": "pitched", "overhang": 1, "chimney": False},
        "features": [],
        "foundation": {"height": 1, "material": "stone"},
        "windows": {"pattern": "even_spaced", "spacing": 3},
    })

    return run_pipeline(user_request, output_path)
