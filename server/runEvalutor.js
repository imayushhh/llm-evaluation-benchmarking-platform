import { MongoClient } from "mongodb";
import { askModel } from "./modelRouter.js";
import { extractFinalAnswer } from "./utils.js";
import { ObjectId } from "mongodb";


export async function runEval({ model, mode, limit = 10, ws }) {
  const mongo = new MongoClient();
  await mongo.connect();

  const db = mongo.db("ai_evaluation");
  const testCol = db.collection("test_data");

  // 🔑 model-specific results collection
  const outCol = db.collection(`${model}_results`);
  await outCol.createIndex(
  { question_id: 1, model: 1, mode: 1 },
  { unique: true }
);

  const evaluatedIds = await outCol
  .find({ model, mode })
  .project({ question_id: 1 })
  .toArray();

  const evaluatedSet = evaluatedIds.map(d =>
  typeof d.question_id === "string"
    ? new ObjectId(d.question_id)
    : d.question_id
);


  // 2️⃣ Fetch ONLY unseen questions
  const docs = await testCol
    .find({ _id: { $nin: evaluatedSet } })
    .limit(limit)
    .toArray();

  let correctCount = 0;
  let totalLatency = 0;
  let latencyCount = 0;

  if (docs.length === 0) {
  ws.broadcast({
    type: "done",
    model,
    mode,
    total: 0,
    accuracy: 0,
    avg_latency_ms: null,
    msg: "No new questions left to evaluate"
  });

  await mongo.close();
  return;
}


  ws.broadcast({
    type: "start",
    model,
    mode,
    total: docs.length
  });

  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];

    ws.broadcast({
      type: "progress",
      model,
      mode,
      idx: i + 1,
      total: docs.length,
      msg: `(${i + 1}/${docs.length}) Running ${model.toUpperCase()}...`
    });

    const groundTruth = extractFinalAnswer(d.answer);

    const { raw, answer, latency } = await askModel(model, d.question);

    if (typeof latency === "number") {
      totalLatency += latency;
      latencyCount++;
    }

    const isCorrect =
      groundTruth !== null &&
      answer !== null &&
      answer === groundTruth;

    if (isCorrect) correctCount++;

try {
  await outCol.insertOne({
    question_id: d._id,
    question: d.question,
    model,
    mode,
    model_answer: answer,
    model_raw: raw,
    ground_truth: groundTruth,
    correct: isCorrect,
    latency_ms: latency,
    created_at: new Date()
  });
} catch (e) {
  // Ignore duplicate question inserts
  if (e.code !== 11000) throw e;
};

    ws.broadcast({
      type: "result",
      model,
      mode,
      question_id: String(d._id),
      answer,
      ground_truth: groundTruth,
      correct: isCorrect,
      latency_ms: latency,
      running_accuracy: Number(((correctCount / (i + 1)) * 100).toFixed(2))
    });

    await new Promise(r => setTimeout(r, 1000));
  }

  ws.broadcast({
    type: "done",
    model,
    mode,
    total: docs.length,
    accuracy: docs.length
      ? Number(((correctCount / docs.length) * 100).toFixed(2))
      : 0,
    avg_latency_ms: latencyCount
      ? Math.round(totalLatency / latencyCount)
      : null
  });

  await mongo.close();
}
