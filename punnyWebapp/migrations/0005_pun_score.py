# Generated by Django 3.1.7 on 2021-08-17 03:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('punnyWebapp', '0004_auto_20210815_0902'),
    ]

    operations = [
        migrations.AddField(
            model_name='pun',
            name='score',
            field=models.IntegerField(default=0),
        ),
    ]