"""Seed runner — loads 32 domain JSON files into the database."""
import json
import os
import asyncio
from pathlib import Path

from sqlmodel import select

from app.core.database import async_session
from app.core.security import get_password_hash
from app.models.domain import Domain, QuestionBank
from app.models.user import User, UserRole


SEED_DIR = Path(__file__).parent / "domain_data"

CATEGORIES = {
    "healthcare": [
        "nursing", "pharmacy", "medical_technology",
        "healthcare_administration", "physical_therapy", "dental_hygiene",
    ],
    "finance": [
        "banking", "insurance", "accounting",
        "financial_planning", "auditing",
    ],
    "manufacturing": [
        "quality_control", "production_management", "supply_chain",
        "industrial_safety", "lean_manufacturing", "process_engineering",
    ],
    "logistics": [
        "warehouse_management", "transportation", "freight_forwarding",
        "inventory_management", "last_mile_delivery",
    ],
    "engineering": [
        "civil_engineering", "mechanical_engineering", "electrical_engineering",
        "chemical_engineering", "environmental_engineering",
        "structural_engineering", "project_management",
        "construction_management", "industrial_engineering", "biomedical_engineering",
    ],
}


async def seed_domains():
    """Load all domain seed files into the database."""
    async with async_session() as session:
        total_domains = 0
        total_questions = 0

        for category, domains in CATEGORIES.items():
            for domain_slug in domains:
                file_path = SEED_DIR / category / f"{domain_slug}.json"
                if not file_path.exists():
                    print(f"  [SKIP] {file_path} not found")
                    continue

                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                # Check if domain already exists
                result = await session.execute(
                    select(Domain).where(
                        Domain.slug == data["slug"],
                        Domain.sector_slug == data["sector_slug"],
                    )
                )
                existing = result.scalar_one_or_none()
                if existing:
                    print(f"  [EXISTS] {data['name']} ({data['sector']})")
                    continue

                # Create domain
                domain = Domain(
                    name=data["name"],
                    slug=data["slug"],
                    sector=data["sector"],
                    sector_slug=data["sector_slug"],
                    description=data.get("description", ""),
                )
                session.add(domain)
                await session.flush()
                total_domains += 1

                # Create questions
                for q in data.get("questions", []):
                    question = QuestionBank(
                        domain_id=domain.id,
                        question_text=q["question_text"],
                        question_type=q.get("question_type", "technical"),
                        difficulty=q.get("difficulty", "medium"),
                        expected_answer=q.get("expected_answer", ""),
                        keywords={"keywords": q.get("keywords", [])},
                    )
                    session.add(question)
                    total_questions += 1

                print(f"  [ADDED] {data['name']} ({data['sector']}) — {len(data.get('questions', []))} questions")

        await session.commit()
        print(f"\nSeeding complete: {total_domains} domains, {total_questions} questions added.")


async def seed_demo_user():
    """Create the demo user if it doesn't exist."""
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == "demo@hireez.com"))
        if result.scalar_one_or_none():
            print("  [EXISTS] Demo user (demo@hireez.com)")
            return

        user = User(
            email="demo@hireez.com",
            hashed_password=get_password_hash("DemoPass123"),
            full_name="Demo User",
            role=UserRole.HR_MANAGER,
            is_active=True,
        )
        session.add(user)
        await session.commit()
        print("  [ADDED] Demo user (demo@hireez.com) — role: hr_manager")


def run():
    asyncio.run(seed_domains())
    asyncio.run(seed_demo_user())


if __name__ == "__main__":
    run()
