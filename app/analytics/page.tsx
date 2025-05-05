"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Droplet, Scale, Activity, Thermometer } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Generate realistic blood pressure data
const generateBloodPressureData = () => {
  const data = []
  const startDate = new Date(2025, 1, 1)

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i * 3)

    // Base values with some randomness
    const systolicBase = 120 + Math.sin(i * 0.3) * 10
    const diastolicBase = 80 + Math.sin(i * 0.3) * 5

    data.push({
      date: date.toISOString().split("T")[0],
      systolic: Math.round(systolicBase + (Math.random() * 10 - 5)),
      diastolic: Math.round(diastolicBase + (Math.random() * 6 - 3)),
    })
  }

  return data
}

// Generate blood sugar data
const generateBloodSugarData = () => {
  const data = []
  const startDate = new Date(2025, 1, 1)

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i * 3)

    // Base values with some randomness
    const fastingBase = 95 + Math.sin(i * 0.4) * 10
    const postMealBase = 140 + Math.sin(i * 0.4) * 20

    data.push({
      date: date.toISOString().split("T")[0],
      fasting: Math.round(fastingBase + (Math.random() * 10 - 5)),
      postMeal: Math.round(postMealBase + (Math.random() * 15 - 7.5)),
    })
  }

  return data
}

// Generate weight and BMI data
const generateWeightBmiData = () => {
  const data = []
  const startDate = new Date(2025, 1, 1)
  const startWeight = 165

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i * 3)

    // Slight downward trend with fluctuations
    const weight = startWeight - i * 0.1 + (Math.random() * 2 - 1)
    const heightInMeters = 1.75
    const bmi = weight / (heightInMeters * heightInMeters)

    data.push({
      date: date.toISOString().split("T")[0],
      weight: Number.parseFloat(weight.toFixed(1)),
      bmi: Number.parseFloat(bmi.toFixed(1)),
    })
  }

  return data
}

// Generate cholesterol data
const generateCholesterolData = () => {
  const data = []
  const startDate = new Date(2024, 6, 1)

  for (let i = 0; i < 6; i++) {
    const date = new Date(startDate)
    date.setMonth(startDate.getMonth() + i * 2)

    data.push({
      date: date.toISOString().split("T")[0],
      total: Math.round(180 - i * 3 + (Math.random() * 10 - 5)),
      ldl: Math.round(110 - i * 2 + (Math.random() * 8 - 4)),
      hdl: Math.round(50 + i * 0.5 + (Math.random() * 5 - 2.5)),
      triglycerides: Math.round(140 - i * 4 + (Math.random() * 15 - 7.5)),
    })
  }

  return data
}

// Generate sleep data
const generateSleepData = () => {
  const data = []
  const startDate = new Date(2025, 4, 1)

  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    // Base hours with some randomness
    const deepSleep = 1.5 + Math.random() * 1
    const lightSleep = 3.5 + Math.random() * 1.5
    const remSleep = 1.2 + Math.random() * 0.8

    data.push({
      date: date.toISOString().split("T")[0],
      deep: Number.parseFloat(deepSleep.toFixed(1)),
      light: Number.parseFloat(lightSleep.toFixed(1)),
      rem: Number.parseFloat(remSleep.toFixed(1)),
      total: Number.parseFloat((deepSleep + lightSleep + remSleep).toFixed(1)),
    })
  }

  return data
}

// Health score breakdown data
const healthScoreData = [
  { name: "Cardiovascular", value: 82 },
  { name: "Weight", value: 65 },
  { name: "Sleep", value: 78 },
  { name: "Activity", value: 70 },
  { name: "Nutrition", value: 85 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("3 Months")
  const [bloodPressureData, setBloodPressureData] = useState([])
  const [bloodSugarData, setBloodSugarData] = useState([])
  const [weightBmiData, setWeightBmiData] = useState([])
  const [cholesterolData, setCholesterolData] = useState([])
  const [sleepData, setSleepData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    setIsLoading(true)
    setTimeout(() => {
      setBloodPressureData(generateBloodPressureData())
      setBloodSugarData(generateBloodSugarData())
      setWeightBmiData(generateWeightBmiData())
      setCholesterolData(generateCholesterolData())
      setSleepData(generateSleepData())
      setIsLoading(false)
    }, 1000)
  }, [timeRange])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Health Analytics</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time Period:</span>
            <select
              className="bg-background border rounded px-2 py-1 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <Button variant="outline" size="sm" className="rounded-full bg-yellow-500 text-white hover:bg-yellow-600">
            Analytics
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-accent/20 p-4 rounded-lg h-32 animate-pulse">
              <div className="h-6 bg-accent/30 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-accent/30 rounded w-1/2 mb-2"></div>
              <div className="h-16 bg-accent/30 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-accent/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-rose-500" />
              <div>
                <div className="text-sm text-muted-foreground">Blood Pressure</div>
                <div className="text-2xl font-semibold flex items-baseline">
                  128/82 <span className="text-sm text-green-500 ml-2">↑4%</span>
                </div>
              </div>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bloodPressureData.slice(-10)}>
                  <Line type="monotone" dataKey="systolic" stroke="#eab308" strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={false}
                    opacity={0.7}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Droplet className="h-6 w-6 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Blood Sugar</div>
                <div className="text-2xl font-semibold flex items-baseline">
                  105 mg/dL <span className="text-sm text-green-500 ml-2">↑2%</span>
                </div>
              </div>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bloodSugarData.slice(-10)}>
                  <Line type="monotone" dataKey="fasting" stroke="#eab308" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-6 w-6 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Weight / BMI</div>
                <div className="text-2xl font-semibold flex items-baseline">
                  {weightBmiData.length > 0 ? weightBmiData[weightBmiData.length - 1].weight : 165} lbs /{" "}
                  {weightBmiData.length > 0 ? weightBmiData[weightBmiData.length - 1].bmi : 27.2}{" "}
                  <span className="text-sm text-green-500 ml-2">↑1.3%</span>
                </div>
              </div>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightBmiData.slice(-10)}>
                  <Line type="monotone" dataKey="weight" stroke="#eab308" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-6 w-6 text-amber-500" />
              <div>
                <div className="text-sm text-muted-foreground">Health Score</div>
                <div className="text-2xl font-semibold">78/100</div>
              </div>
            </div>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthScoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={30}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {healthScoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="blood-pressure" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
          <TabsTrigger value="blood-sugar">Blood Sugar</TabsTrigger>
          <TabsTrigger value="weight-bmi">Weight & BMI</TabsTrigger>
          <TabsTrigger value="cholesterol">Cholesterol</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
        </TabsList>

        <TabsContent value="blood-pressure" className="bg-accent/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-1">Blood Pressure Trends</h2>
          <p className="text-sm text-muted-foreground mb-4">Systolic and diastolic readings over time (mmHg)</p>

          {isLoading ? (
            <div className="h-64 bg-accent/30 animate-pulse rounded"></div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bloodPressureData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis domain={[60, 160]} />
                  <Tooltip
                    formatter={(value) => [`${value} mmHg`, undefined]}
                    labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#eab308"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Systolic"
                    activeDot={{ r: 6, stroke: "#eab308", strokeWidth: 2, fill: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#fcd34d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Diastolic"
                    activeDot={{ r: 6, stroke: "#fcd34d", strokeWidth: 2, fill: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-accent/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Average Systolic</h3>
              <p className="text-2xl font-semibold text-yellow-500">
                {isLoading
                  ? "..."
                  : Math.round(
                      bloodPressureData.reduce((acc, item) => acc + item.systolic, 0) / bloodPressureData.length,
                    )}{" "}
                <span className="text-sm font-normal">mmHg</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Normal range: 90-120 mmHg</p>
            </div>
            <div className="bg-accent/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Average Diastolic</h3>
              <p className="text-2xl font-semibold text-yellow-500">
                {isLoading
                  ? "..."
                  : Math.round(
                      bloodPressureData.reduce((acc, item) => acc + item.diastolic, 0) / bloodPressureData.length,
                    )}{" "}
                <span className="text-sm font-normal">mmHg</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">Normal range: 60-80 mmHg</p>
            </div>
            <div className="bg-accent/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Classification</h3>
              <p className="text-xl font-semibold text-yellow-500">Elevated</p>
              <p className="text-sm text-muted-foreground mt-1">Based on your recent readings</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blood-sugar">
          <div className="bg-accent/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Blood Sugar Trends</h2>
            <p className="text-muted-foreground text-sm mb-4">Fasting and post-meal glucose levels over time (mg/dL)</p>

            {isLoading ? (
              <div className="h-64 bg-accent/30 animate-pulse rounded"></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bloodSugarData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis domain={[60, 200]} />
                    <Tooltip
                      formatter={(value) => [`${value} mg/dL`, undefined]}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="fasting"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Fasting"
                      activeDot={{ r: 6, stroke: "#eab308", strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="postMeal"
                      stroke="#fcd34d"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Post-Meal"
                      activeDot={{ r: 6, stroke: "#fcd34d", strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Average Fasting</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading
                    ? "..."
                    : Math.round(
                        bloodSugarData.reduce((acc, item) => acc + item.fasting, 0) / bloodSugarData.length,
                      )}{" "}
                  <span className="text-sm font-normal">mg/dL</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Normal range: 70-100 mg/dL</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Average Post-Meal</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading
                    ? "..."
                    : Math.round(
                        bloodSugarData.reduce((acc, item) => acc + item.postMeal, 0) / bloodSugarData.length,
                      )}{" "}
                  <span className="text-sm font-normal">mg/dL</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Normal range: 70-140 mg/dL</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Classification</h3>
                <p className="text-xl font-semibold text-yellow-500">Normal</p>
                <p className="text-sm text-muted-foreground mt-1">Based on your recent readings</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weight-bmi">
          <div className="bg-accent/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Weight & BMI Trends</h2>
            <p className="text-muted-foreground text-sm mb-4">Weight and BMI measurements over time</p>

            {isLoading ? (
              <div className="h-64 bg-accent/30 animate-pulse rounded"></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightBmiData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis yAxisId="left" domain={[150, 180]} />
                    <YAxis yAxisId="right" orientation="right" domain={[20, 30]} />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} ${name === "weight" ? "lbs" : ""}`,
                        name === "weight" ? "Weight" : "BMI",
                      ]}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#eab308"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Weight"
                      activeDot={{ r: 6, stroke: "#eab308", strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bmi"
                      stroke="#fcd34d"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="BMI"
                      activeDot={{ r: 6, stroke: "#fcd34d", strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Weight</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading ? "..." : weightBmiData[weightBmiData.length - 1]?.weight}{" "}
                  <span className="text-sm font-normal">lbs</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Trend: -0.5 lbs/week</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current BMI</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading ? "..." : weightBmiData[weightBmiData.length - 1]?.bmi}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Classification: Overweight</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Goal Weight</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  155 <span className="text-sm font-normal">lbs</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Target BMI: 24.9</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cholesterol">
          <div className="bg-accent/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Cholesterol Trends</h2>
            <p className="text-muted-foreground text-sm mb-4">HDL, LDL, and total cholesterol levels over time</p>

            {isLoading ? (
              <div className="h-64 bg-accent/30 animate-pulse rounded"></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cholesterolData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                      }
                    />
                    <YAxis domain={[0, 250]} />
                    <Tooltip
                      formatter={(value) => [`${value} mg/dL`, undefined]}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="#eab308" />
                    <Bar dataKey="ldl" name="LDL" fill="#fcd34d" />
                    <Bar dataKey="hdl" name="HDL" fill="#facc15" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Total Cholesterol</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading ? "..." : cholesterolData[cholesterolData.length - 1]?.total}{" "}
                  <span className="text-sm font-normal">mg/dL</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Target: {"<"}200 mg/dL</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">LDL (Bad)</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading ? "..." : cholesterolData[cholesterolData.length - 1]?.ldl}{" "}
                  <span className="text-sm font-normal">mg/dL</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Target: {"<"}100 mg/dL</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">HDL (Good)</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading ? "..." : cholesterolData[cholesterolData.length - 1]?.hdl}{" "}
                  <span className="text-sm font-normal">mg/dL</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Target: {">"}40 mg/dL</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Triglycerides</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading ? "..." : cholesterolData[cholesterolData.length - 1]?.triglycerides}{" "}
                  <span className="text-sm font-normal">mg/dL</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Target: {"<"}150 mg/dL</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sleep">
          <div className="bg-accent/20 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Sleep Patterns</h2>
            <p className="text-muted-foreground text-sm mb-4">Sleep duration and quality over time</p>

            {isLoading ? (
              <div className="h-64 bg-accent/30 animate-pulse rounded"></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      formatter={(value) => [`${value} hours`, undefined]}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="deep"
                      stackId="1"
                      stroke="#eab308"
                      fill="#eab308"
                      name="Deep Sleep"
                    />
                    <Area
                      type="monotone"
                      dataKey="light"
                      stackId="1"
                      stroke="#fcd34d"
                      fill="#fcd34d"
                      name="Light Sleep"
                    />
                    <Area type="monotone" dataKey="rem" stackId="1" stroke="#facc15" fill="#facc15" name="REM Sleep" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Average Total Sleep</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading
                    ? "..."
                    : (sleepData.reduce((acc, item) => acc + item.total, 0) / sleepData.length).toFixed(1)}{" "}
                  <span className="text-sm font-normal">hours</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Recommended: 7-9 hours</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Deep Sleep</h3>
                <p className="text-2xl font-semibold text-yellow-500">
                  {isLoading
                    ? "..."
                    : (sleepData.reduce((acc, item) => acc + item.deep, 0) / sleepData.length).toFixed(1)}{" "}
                  <span className="text-sm font-normal">hours</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">Ideal: 1.5-2 hours</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sleep Quality</h3>
                <p className="text-2xl font-semibold text-yellow-500">Good</p>
                <p className="text-sm text-muted-foreground mt-1">Based on sleep cycles</p>
              </div>
              <div className="bg-accent/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Sleep Score</h3>
                <p className="text-2xl font-semibold text-yellow-500">78/100</p>
                <p className="text-sm text-muted-foreground mt-1">Above average</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-accent/20 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Health Insights & Recommendations</h2>
        <p className="text-sm text-muted-foreground mb-6">AI-generated insights based on your health metrics</p>

        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Heart className="h-5 w-5 mr-2" /> Blood Pressure Insight
            </h3>
            <p>
              Your blood pressure readings are showing improvement over the past 3 months, with a 4% reduction in
              systolic pressure. Continue with your current medication regimen and consider maintaining or slightly
              increasing your physical activity.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Droplet className="h-5 w-5 mr-2" /> Blood Sugar Insight
            </h3>
            <p>
              Recent fasting blood sugar values are consistently within the normal range (70-100 mg/dL), indicating good
              glycemic control. Continue with your current diet and monitoring schedule.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Scale className="h-5 w-5 mr-2" /> Weight Management
            </h3>
            <p>
              Your BMI has decreased from 28.5 to 27.2, showing positive progress. Consider scheduling your next
              cholesterol screening as your last one was over 6 months ago.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Thermometer className="h-5 w-5 mr-2" /> Recommended Actions
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Schedule a follow-up appointment with your primary care physician</li>
              <li>Continue monitoring blood pressure 2-3 times per week</li>
              <li>Maintain current exercise routine of 30 minutes, 5 days per week</li>
              <li>Consider reducing sodium intake to help further lower blood pressure</li>
              <li>Schedule your annual cholesterol screening</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
