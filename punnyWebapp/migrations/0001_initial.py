# Generated by Django 3.1.7 on 2021-08-11 11:23

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Pun',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pun_content', models.JSONField()),
                ('pub_date', models.DateTimeField(verbose_name='date published')),
                ('good_votes', models.IntegerField(default=0)),
                ('ok_votes', models.IntegerField(default=0)),
                ('bad_votes', models.IntegerField(default=0)),
            ],
        ),
    ]
