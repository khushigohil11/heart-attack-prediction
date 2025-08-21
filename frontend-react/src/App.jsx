import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// const API_BASE = "http://127.0.0.1:8000";
const API_BASE = "https://heart-attack-prediction-cc2o.onrender.com";

const initialForm = {
  age: "",
  Systolic_BP_mmHg: "",
  Diastolic_BP_mmHg: "",
  Heart_Rate_bpm: "",
  Blood_Oxygen_Level_SpO2_percent: "",
  Temperature_C: "",
  height_cm: "",
  weight_kg: "",
  BMI_kg_per_m2: "",
  ecg_heart_rate_bpm: "",
  ecg_qrs_duration_ms: "",
  ecg_st_deviation_mV: "",
  ecg_r_peak_mV: "",
  ecg_abnormal: 0,
  blood_sugar_mg_dL: "",
  family_history: 0,
  sex_encoded: 1,
  ecg_label_encoded: 0,
  smoking_status_Former: 0,
  smoking_status_Never: 1,
  physical_activity_level_Low: 0,
  physical_activity_level_Medium: 1,
  diet_quality_Good: 0,
  diet_quality_Poor: 1,
  stress_level_Low: 0,
  stress_level_Medium: 1,
};

function Section({ title, children }) {
  return (
    <div className="bg-white/80 rounded-2xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold text-purple-700">{title}</h2>
      {children}
    </div>
  );
}

function NumberInput({ name, label, value, onChange, step = "any" }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="number"
        name={name}
        step={step}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
        placeholder={label}
        required
      />
    </label>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const h = parseFloat(form.height_cm);
    const w = parseFloat(form.weight_kg);
    if (h > 0 && w > 0) {
      const bmi = w / (h / 100) ** 2;
      setForm((f) => ({ ...f, BMI_kg_per_m2: bmi.toFixed(1) }));
    }
  }, [form.height_cm, form.weight_kg]);

  const gradientFrom = useMemo(() => {
    if (!result) return "#a78bfa";
    const s = result.score;
    if (s < 30) return "#22c55e";
    if (s < 60) return "#f59e0b";
    return "#ef4444";
  }, [result]);

  const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const chooseRadio = (patch) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (typeof payload[k] === "string" && payload[k] !== "") {
          const num = Number(payload[k]);
          if (!Number.isNaN(num)) payload[k] = num;
        }
      });
      const { data } = await axios.post(API_BASE + "/predict", payload);
      if (data.error) setResult({ error: data.error });
      else setResult({ score: data.score, message: data.message });
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-purple-700">
            💖 Heart Risk Predictor
          </h1>
          <p className="text-gray-600 mt-1">
            Enter details and get your animated risk score with a motivational
            tip.
          </p>
        </header>

        <form onSubmit={submit} className="grid md:grid-cols-2 gap-6">
          <Section title="Basic Info">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                name="age"
                label="Age (years)"
                value={form.age}
                onChange={onChange}
                step="1"
              />
              <div className="col-span-1">
                <span className="text-sm text-gray-700">Sex</span>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sex"
                      defaultChecked={form.sex_encoded === 1}
                      onChange={() => chooseRadio({ sex_encoded: 1 })}
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sex"
                      onChange={() => chooseRadio({ sex_encoded: 0 })}
                    />
                    <span>Female</span>
                  </label>
                </div>
              </div>
              <NumberInput
                name="height_cm"
                label="Height (cm)"
                value={form.height_cm}
                onChange={onChange}
              />
              <NumberInput
                name="weight_kg"
                label="Weight (kg)"
                value={form.weight_kg}
                onChange={onChange}
              />
              <NumberInput
                name="BMI_kg_per_m2"
                label="BMI (auto)"
                value={form.BMI_kg_per_m2}
                onChange={onChange}
              />
              <div className="col-span-2">
                <span className="text-sm text-gray-700">Family History</span>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fh"
                      defaultChecked={form.family_history === 1}
                      onChange={() => chooseRadio({ family_history: 1 })}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="fh"
                      onChange={() => chooseRadio({ family_history: 0 })}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Vitals">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                name="Systolic_BP_mmHg"
                label="Systolic BP (mmHg)"
                value={form.Systolic_BP_mmHg}
                onChange={onChange}
              />
              <NumberInput
                name="Diastolic_BP_mmHg"
                label="Diastolic BP (mmHg)"
                value={form.Diastolic_BP_mmHg}
                onChange={onChange}
              />
              <NumberInput
                name="Heart_Rate_bpm"
                label="Heart Rate (bpm)"
                value={form.Heart_Rate_bpm}
                onChange={onChange}
              />
              <NumberInput
                name="Blood_Oxygen_Level_SpO2_percent"
                label="SpO₂ (%)"
                value={form.Blood_Oxygen_Level_SpO2_percent}
                onChange={onChange}
              />
              <NumberInput
                name="Temperature_C"
                label="Temperature (°C)"
                value={form.Temperature_C}
                onChange={onChange}
              />
              <NumberInput
                name="blood_sugar_mg_dL"
                label="Blood Sugar (mg/dL)"
                value={form.blood_sugar_mg_dL}
                onChange={onChange}
              />
            </div>
          </Section>

          <Section title="ECG">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                name="ecg_heart_rate_bpm"
                label="ECG Heart Rate (bpm)"
                value={form.ecg_heart_rate_bpm}
                onChange={onChange}
              />
              <NumberInput
                name="ecg_qrs_duration_ms"
                label="QRS Duration (ms)"
                value={form.ecg_qrs_duration_ms}
                onChange={onChange}
              />
              <NumberInput
                name="ecg_st_deviation_mV"
                label="ST Deviation (mV)"
                value={form.ecg_st_deviation_mV}
                onChange={onChange}
              />
              <NumberInput
                name="ecg_r_peak_mV"
                label="R Peak (mV)"
                value={form.ecg_r_peak_mV}
                onChange={onChange}
              />
              <div className="col-span-2">
                <span className="text-sm text-gray-700">
                  ECG Label / Abnormal?
                </span>
                <div className="flex flex-wrap items-center gap-6 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ecglabel"
                      onChange={() => chooseRadio({ ecg_label_encoded: 0 })}
                    />
                    <span>Normal</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ecglabel"
                      onChange={() => chooseRadio({ ecg_label_encoded: 1 })}
                    />
                    <span>Abnormal Label</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ecgabn"
                      onChange={() => chooseRadio({ ecg_abnormal: 0 })}
                    />
                    <span>ECG Abnormal: No</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="ecgabn"
                      onChange={() => chooseRadio({ ecg_abnormal: 1 })}
                    />
                    <span>ECG Abnormal: Yes</span>
                  </label>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Lifestyle">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <span className="text-sm text-gray-700">Smoking</span>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="smoke"
                      onChange={() =>
                        chooseRadio({
                          smoking_status_Former: 1,
                          smoking_status_Never: 0,
                        })
                      }
                    />
                    <span>Former</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="smoke"
                      onChange={() =>
                        chooseRadio({
                          smoking_status_Former: 0,
                          smoking_status_Never: 1,
                        })
                      }
                    />
                    <span>Never</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-gray-700">Physical Activity</span>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="activity"
                      onChange={() =>
                        chooseRadio({
                          physical_activity_level_Low: 1,
                          physical_activity_level_Medium: 0,
                        })
                      }
                    />
                    <span>Low</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="activity"
                      onChange={() =>
                        chooseRadio({
                          physical_activity_level_Low: 0,
                          physical_activity_level_Medium: 1,
                        })
                      }
                    />
                    <span>Medium</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-gray-700">Diet Quality</span>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="diet"
                      onChange={() =>
                        chooseRadio({
                          diet_quality_Good: 1,
                          diet_quality_Poor: 0,
                        })
                      }
                    />
                    <span>Good</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="diet"
                      onChange={() =>
                        chooseRadio({
                          diet_quality_Good: 0,
                          diet_quality_Poor: 1,
                        })
                      }
                    />
                    <span>Poor</span>
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-sm text-gray-700">Stress Level</span>
                <div className="flex items-center gap-4 mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="stress"
                      onChange={() =>
                        chooseRadio({
                          stress_level_Low: 1,
                          stress_level_Medium: 0,
                        })
                      }
                    />
                    <span>Low</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="stress"
                      onChange={() =>
                        chooseRadio({
                          stress_level_Low: 0,
                          stress_level_Medium: 1,
                        })
                      }
                    />
                    <span>Medium</span>
                  </label>
                </div>
              </div>
            </div>
          </Section>

          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-2xl text-white font-bold shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-transform hover:scale-105"
            >
              {loading ? "Predicting..." : "Predict"}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {result && !result.error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="mt-8 max-w-xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-6">
                <div className="w-40 h-40">
                  <CircularProgressbar
                    value={result.score}
                    text={`${result.score}%`}
                    styles={buildStyles({
                      pathColor: gradientFrom,
                      textColor: gradientFrom,
                      trailColor: "#e5e7eb",
                      pathTransitionDuration: 1.5,
                    })}
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: gradientFrom }}
                  >
                    Your Risk Score
                  </h3>
                  <p className="mt-2 text-gray-700">{result.message}</p>
                </div>
              </div>
            </motion.div>
          )}

          {result && result.error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-red-600 font-medium"
            >
              {result.error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
