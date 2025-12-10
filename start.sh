#!/bin/bash

echo "Stopping Docker..."
sudo systemctl stop docker

echo "Starting Docker..."
sudo systemctl start docker

echo "Checking Docker status..."
sudo systemctl status docker

