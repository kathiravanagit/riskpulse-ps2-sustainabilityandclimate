from fastapi import APIRouter
from app.services.simulation_service import simulation_service
from app.db.mongodb import get_database
from app.api.risk import _calculate_risk_for_location

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/start")
async def start_simulation(location_id: str = "LOC-VELACH-001"):
    import asyncio

    async def run():
        for stage in simulation_service.stages:
            if not simulation_service.is_running:
                break
            simulation_service.current_stage = simulation_service.stages.index(stage)
            await simulation_service.simulate_stage(location_id, stage)
            await _calculate_risk_for_location(location_id)
            await asyncio.sleep(1)

    simulation_service.is_running = True
    asyncio.create_task(run())
    return {"status": "started", "location_id": location_id}


@router.post("/stop")
async def stop_simulation():
    await simulation_service.stop_simulation()
    return {"status": "stopped"}


@router.get("/status")
async def get_simulation_status():
    return simulation_service.get_status()
