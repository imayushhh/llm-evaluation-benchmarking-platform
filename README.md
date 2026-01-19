🚀 LLM Evaluation & Benchmarking Platform

An end-to-end platform to evaluate, benchmark, and analyze large language models (LLMs) by measuring accuracy and latency on reasoning-heavy datasets.
This project investigates whether training improves reasoning performance and compares open-source LLMs under controlled conditions.

📌 Project Overview

This project was built to answer two practical questions:

Does training (fine-tuning) actually improve reasoning performance?

How do modern open-source reasoning models compare under identical conditions?

Rather than relying on leaderboard claims, this platform provides a reproducible, system-level evaluation pipeline with real-time visualization.

🧱 Data Ingestion & Preparation Pipeline

Before evaluation, a production-style data pipeline was implemented:

Dataset Source: GSM8K from Hugging Face

Processing Layer:

A GCP Hadoop cluster was provisioned to download, clean, and normalize the dataset

Schema validation and transformation were performed at scale

Storage:

The cleaned dataset was transferred to MongoDB Atlas

MongoDB served as the single source of truth for all evaluations

This design separates data engineering from model evaluation, mirroring real-world ML systems.

🔬 Evaluation Methodology

The evaluation was conducted in two distinct experimental phases.

Part 1: Does Training Improve Reasoning Performance?

Objective:
Determine whether training provides measurable gains on reasoning tasks.

Setup:

Dataset: GSM8K

Evaluation modes:

Zero-shot inference

Fine-tuned inference

Metrics:

Accuracy

Average response latency

Findings:

Fine-tuning did not consistently outperform zero-shot inference

In multiple cases, zero-shot performance matched or exceeded trained models

Training introduced additional complexity without guaranteed benefits

Part 2: Open-Source Model Benchmarking

Objective:
Compare two open-source reasoning models under identical conditions.

Models Evaluated:

DeepSeek

Qwen

Results:

Comparable accuracy

Different latency profiles

Model choice depends on use case constraints, not accuracy alone

🏗️ System Architecture

Hugging Face Dataset
↓
GCP Hadoop Cluster (Cleaning & Transformation)
↓
MongoDB Atlas
↓
Evaluation Engine (Node.js)
↓
WebSockets (Live Updates)
↓
Frontend Dashboard (Chart.js)

🛠️ Tech Stack

Data Engineering:
GCP, Hadoop, Hugging Face, MongoDB Atlas

Backend:
Node.js, Express, WebSockets

Frontend:
HTML, CSS, JavaScript, Chart.js

👤 Author

Ayush Gupta
LLM Evaluation & Benchmarking Platform
