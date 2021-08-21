from django.db import models
import uuid

class Pun(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    pun_content = models.JSONField()
    pub_date = models.DateTimeField(auto_now=True)
    good_votes = models.IntegerField(default=0)
    ok_votes = models.IntegerField(default=0)
    bad_votes = models.IntegerField(default=0)
    score = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        modifier = ((self.good_votes + self.ok_votes + self.bad_votes) * 1.1)
        if (modifier == 0):
            modifier = 1
        score = ((self.good_votes * 2) + (self.ok_votes) - (self.bad_votes * 0.5)) * modifier
        self.score = score
        super().save(*args, **kwargs)