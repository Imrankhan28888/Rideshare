# Generated by Django 2.2 on 2020-11-19 20:56

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('rides', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ride',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('pick_up_address', models.CharField(max_length=255)),
                ('drop_off_address', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('REQUESTED', 'REQUESTED'), ('STARTED', 'STARTED'), ('IN_PROGRESS', 'IN_PROGRESS'), ('COMPLETED', 'COMPLETED')], default='REQUESTED', max_length=20)),
            ],
        ),
    ]
