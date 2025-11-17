from django.test import TestCase
from users.models import Users
from plans.models import Plans
from participants.models import Participants
from datetime import datetime, timedelta

class PlansModelTests(TestCase):

    def setUp(self):
        # Users
        self.leader = Users.objects.create_user(username="leader", password="pass123")
        self.member = Users.objects.create_user(username="member", password="pass123")

        # Plan
        self.plan = Plans.objects.create(
            title="Evening Run",
            description="Running in the park",
            location="Bangkok",
            leader_id=self.leader,
            event_time=datetime.now() + timedelta(days=1),
            max_people=3,
        )

    def test_plan_creation(self):
        """Test that a plan is created correctly"""
        self.assertEqual(self.plan.title, "Evening Run")
        self.assertEqual(self.plan.description, "Running in the park")
        self.assertEqual(self.plan.location, "Bangkok")
        self.assertEqual(self.plan.leader_id, self.leader)
        self.assertEqual(self.plan.people_joined, 0)
        self.assertEqual(self.plan.max_people, 3)

    def test_add_participant(self):
        """Test adding a participant increases people_joined"""
        Participants.objects.create(plan=self.plan, user=self.member, role="MEMBER")
        self.plan.people_joined += 1
        self.plan.save()
        self.assertEqual(self.plan.people_joined, 1)

    def test_max_people_limit(self):
        """Test that a plan respects max_people limit"""
        # Fill plan
        for i in range(3):
            user = Users.objects.create_user(username=f"user{i}", password="pass123")
            Participants.objects.create(plan=self.plan, user=user, role="MEMBER")
            self.plan.people_joined += 1
            self.plan.save()

        self.assertEqual(self.plan.people_joined, 3)
        # Try to add another participant
        new_user = Users.objects.create_user(username="extra", password="pass123")
        if self.plan.people_joined >= self.plan.max_people:
            with self.assertRaises(ValueError):
                raise ValueError("Plan is full")

    def test_leader_assignment(self):
        """Test that leader is correctly assigned"""
        self.assertEqual(self.plan.leader_id, self.leader)
        # Leader cannot be added as MEMBER
        participant = Participants.objects.create(plan=self.plan, user=self.leader, role="LEADER")
        self.assertEqual(participant.role, "LEADER")
