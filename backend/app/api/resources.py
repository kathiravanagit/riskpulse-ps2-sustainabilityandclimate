from fastapi import APIRouter, HTTPException
from pymongo import ReturnDocument
from app.db.mongodb import get_database
from app.models.resource import Resource, ResourceStatusUpdate

router = APIRouter(prefix="/resources", tags=["operational-resources"])


@router.get("/{location_id}")
async def get_resources(location_id: str):
    db = get_database()
    resources = []
    async for document in db["resources"].find({"location_id": location_id}).sort("category", 1):
        document.pop("_id", None)
        resources.append(Resource(**document))
    return resources


@router.post("", response_model=Resource, status_code=201)
async def create_resource(resource: Resource):
    db = get_database()
    await db["resources"].insert_one(resource.model_dump())
    return resource


@router.patch("/{resource_id}/status", response_model=Resource)
async def update_resource_status(resource_id: str, update: ResourceStatusUpdate):
    db = get_database()
    updated = await db["resources"].find_one_and_update(
        {"resource_id": resource_id},
        {"$set": {"status": update.status}},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")
    updated.pop("_id", None)
    return Resource(**updated)