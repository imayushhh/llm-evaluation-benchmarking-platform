# 🚀 LLM Evaluation & Benchmarking Platform

An end-to-end platform to evaluate, benchmark, and analyze Large Language Models (LLMs) by measuring **accuracy** and **latency** on reasoning-heavy datasets.

This project investigates:
- Whether **training (fine-tuning)** improves reasoning performance
- How **open-source reasoning models** compare under identical conditions

---

## 📌 Project Overview

This project was built to answer two practical questions:

1. **Does training (fine-tuning) actually improve reasoning performance?**
2. **How do modern open-source reasoning models compare under controlled conditions?**

Instead of relying on leaderboard claims, this platform provides a **reproducible, system-level evaluation pipeline** with **real-time visualization**.

---

## 🧱 Data Ingestion & Preparation Pipeline

Before model evaluation, a production-style **data engineering pipeline** was implemented.

### Dataset Source
- **GSM8K** (via Hugging Face)

### Processing Layer
- A **GCP Hadoop cluster** was provisioned to:
  - Download the dataset
  - Clean and normalize records
  - Perform schema validation and transformations at scale

### Storage Layer
- The cleaned dataset was transferred to **MongoDB Atlas**
- MongoDB serves as the **single source of truth** for all evaluations

This separation mirrors real-world ML systems by decoupling **data engineering** from **model evaluation**.

---

## 🔬 Evaluation Methodology

The evaluation was conducted in **two experimental phases**.

---

### Part 1: Does Training Improve Reasoning Performance?

**Objective**  
Determine whether fine-tuning provides measurable gains on reasoning tasks.

**Setup**
- Dataset: GSM8K
- Evaluation modes:
  - Zero-shot inference
  - Fine-tuned inference

**Metrics**
- Accuracy
- Average response latency

**Findings**
- Fine-tuning did **not consistently outperform** zero-shot inference
- In several cases, zero-shot performance **matched or exceeded** trained models
- Training introduced additional complexity **without guaranteed benefits**

---

### Part 2: Open-Source Model Benchmarking

**Objective**  
Compare open-source reasoning models under **identical evaluation conditions**.

**Models Evaluated**
- DeepSeek
- Qwen

**Results**
- Comparable accuracy across models
- Noticeably different latency profiles
- Model choice depends on **deployment constraints**, not accuracy alone

---

## 🏗️ System Architecture

```text
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
