LLM Evaluation & Benchmarking Platform

An end-to-end platform to evaluate and benchmark Large Language Models (LLMs) by measuring accuracy and latency on reasoning-heavy datasets.

This project investigates whether training (fine-tuning) improves reasoning performance and compares open-source reasoning models under identical, reproducible conditions.

Project Overview

This platform was built to answer two practical questions:

Does training (fine-tuning) actually improve reasoning performance?

How do modern open-source reasoning models compare when evaluated under the same setup?

Instead of relying on leaderboard claims, this project implements a system-level evaluation pipeline with controlled experiments and real-time visualization.

Data Ingestion & Preparation Pipeline

Before any evaluation, a production-style data pipeline was implemented.

Dataset Source

GSM8K (from Hugging Face)

Processing Layer

A GCP Hadoop cluster was provisioned

The dataset was downloaded, cleaned, and normalized at scale

Schema validation and transformation were applied

Storage

Cleaned data was transferred to MongoDB Atlas

MongoDB served as the single source of truth for all evaluations

This separation of data engineering and model evaluation mirrors real-world ML systems.

Evaluation Methodology

The evaluation was conducted in two experimental phases.

Part 1: Does Training Improve Reasoning Performance?

Objective
Determine whether training provides measurable gains on reasoning tasks.

Setup

Dataset: GSM8K

Evaluation modes:

Zero-shot inference

Fine-tuned inference

Metrics

Accuracy

Average response latency

Key Findings

Fine-tuning did not consistently outperform zero-shot inference

In multiple cases, zero-shot performance matched or exceeded trained models

Training introduced additional complexity without guaranteed benefits

Part 2: Open-Source Model Benchmarking

Objective
Compare open-source reasoning models under identical conditions.

Models Evaluated

DeepSeek

Qwen

Results

Comparable accuracy across models

Different latency profiles

Model choice depends on system constraints, not accuracy alone

System Architecture

Hugging Face Dataset
→ GCP Hadoop Cluster (Cleaning & Transformation)
→ MongoDB Atlas
→ Evaluation Engine (Node.js)
→ WebSockets (Live Updates)
→ Frontend Dashboard (Chart.js)

Tech Stack

Data Engineering

GCP

Hadoop

Hugging Face

MongoDB Atlas

Backend

Node.js

Express

WebSockets

Frontend

HTML

CSS

JavaScript

Chart.js

Key Takeaways

Training does not automatically improve reasoning performance

Zero-shot models can be surprisingly competitive

Latency is a critical differentiator between models

Reproducible evaluation pipelines matter more than leaderboard scores
