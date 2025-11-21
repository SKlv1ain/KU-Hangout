from django.test import TestCase
from django.utils import timezone
from users.models import Users
from tags.models import Tags
from plans.models import Plans, PlanImage, SavedPlan, PinnedPlan
from django.db import IntegrityError

class PlansModelTest(TestCase):

    def setUp(self):
        # Create a test user
        self.user = Users.objects.create_user(username="user1", password="pass")
        # Create a test tag
        self.tag = Tags.objects.create(name="Sports")
        # Create a test plan
        self.plan = Plans.objects.create(
            title="Soccer Game",
            description="Fun game",
            location="Bangkok",
            event_time=timezone.now() + timezone.timedelta(days=1),
            max_people=5,
            leader_id=self.user,
            people_joined=1
        )
        self.plan.tags.add(self.tag)

    def test_plan_creation(self):
        """Test that a plan can be created correctly."""
        self.assertEqual(self.plan.title, "Soccer Game")
        self.assertEqual(self.plan.leader_id, self.user)
        self.assertIn(self.tag, self.plan.tags.all())

    def test_plan_str_method(self):
        """Test string representation of plan."""
        self.assertEqual(str(self.plan.title), self.plan.title)

    def test_plan_image_creation(self):
        """Test PlanImage creation and string representation."""
        image = PlanImage.objects.create(plan=self.plan, image_url="http://example.com/image.jpg")
        self.assertEqual(image.plan, self.plan)
        self.assertIn("Image for Soccer Game", str(image))

    def test_saved_plan_creation_and_str(self):
        """Test SavedPlan creation and uniqueness constraint."""
        saved = SavedPlan.objects.create(user=self.user, plan=self.plan)
        self.assertEqual(saved.user, self.user)
        self.assertEqual(saved.plan, self.plan)
        self.assertIn(self.user.username, str(saved))
        # Test uniqueness
        with self.assertRaises(IntegrityError):
            SavedPlan.objects.create(user=self.user, plan=self.plan)

    def test_pinned_plan_creation_and_str(self):
        """Test PinnedPlan creation and uniqueness constraint."""
        pinned = PinnedPlan.objects.create(user=self.user, plan=self.plan)
        self.assertEqual(pinned.user, self.user)
        self.assertEqual(pinned.plan, self.plan)
        self.assertIn(self.user.username, str(pinned))
        # Test uniqueness
        with self.assertRaises(IntegrityError):
            PinnedPlan.objects.create(user=self.user, plan=self.plan)

    def test_people_joined_field(self):
        """Test people_joined default value and update."""
        plan2 = Plans.objects.create(
            title="Basketball Game",
            description="Fun game 2",
            location="Chiang Mai",
            event_time=timezone.now() + timezone.timedelta(days=2),
            max_people=5,
            leader_id=self.user
        )
        self.assertEqual(plan2.people_joined, 0)
        plan2.people_joined += 1
        plan2.save()
        self.assertEqual(plan2.people_joined, 1)
