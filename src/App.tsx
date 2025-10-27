"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChevronDown, ChevronUp, Calculator, Loader2 } from "lucide-react"
import "katex/dist/katex.min.css"
import { BlockMath } from "react-katex"

// Get known mathematical constants for comparison
function getKnownValue(n: number): { name: string; approximateValue: number } | null {
  const knownValues: Record<number, { name: string; approximateValue: number }> = {
    3: { name: "Apéry's constant", approximateValue: 1.2020569 },
    5: { name: "ζ(5)", approximateValue: 1.0369278 },
    7: { name: "ζ(7)", approximateValue: 1.0083493 },
    9: { name: "ζ(9)", approximateValue: 1.0020084 },
    11: { name: "ζ(11)", approximateValue: 1.0004942 },
  }
  return knownValues[n] || null
}


export default function ZetaCalculator() {
  const [specialResult, setSpecialResult] = useState<{
  symbolicResult: string
  numericValue: number
  components: Array<{ name: string; value: number; symbolic: string }>
} | null>(null)
  const [input, setInput] = useState("")
  const [result, setResult] = useState<{
    n: number
    value: number
    convergenceData: Array<{ term: number; partialSum: number }>
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState("")
  const [isConvergenceOpen, setIsConvergenceOpen] = useState(false)

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCalculate()
    }
  }

const handleCalculate = async () => {
  const n = Number.parseInt(input);  // ✅ bikin n dari input
    // ✅ Validasi nilai n
    if (isNaN(n)) {
      setError("Please enter a valid number.")
      return
    }
    if (n < 3 || n > 53) {
      setError("Input must be between 3 and 53.")
      return
    }
    if (n % 2 === 0) {
      setError("Only odd integers are allowed.")
      return
    }

    setError("")
    setIsCalculating(true)           // ✅ bukan setLoading

  try {
    const response = await fetch(`http://localhost:8000/calculate?n=${n}`);
    const data = await response.json();

const formattedData = Array.isArray(data.convergence_data)
  ? data.convergence_data.map((d: any) =>
      Array.isArray(d) ? { term: d[0], partialSum: d[1] } : d
    )
  : [];

setResult({
  n: n,
  value: Number(data.series_value),
  convergenceData: formattedData
});


    setSpecialResult({
      symbolicResult: data.recursion,
      numericValue: Number(data.series_value),
      components: [] // sementara kosong karena backend belum kirim components
    });

  } catch (error) {
    console.error(error);
    setError("Failed to fetch from backend");
  } finally {
    setIsCalculating(false);
  }
};



const knownValue = result ? getKnownValue(result.n) : null;


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8 pt-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Calculator className="w-8 h-8 text-gray-700" />
            <h1 className="text-4xl font-bold text-gray-900">ZETHER</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Compute odd values of the Riemann zeta function ζ(n) and visualize series convergence
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <span>Calculate ζ(n)</span>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter an odd integer n ≥ 3 to compute ζ(n) = ∑(1/k^n) for k=1 to ∞
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  min={3}  // ✅ batas bawah
                  max={53} // ✅ batas atas
                  placeholder="Enter odd integer (3 ≤ n ≤ 53)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 text-lg h-12 focus:border-gray-500 focus:ring-gray-500"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <Button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 transition-all duration-200 hover:scale-105"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Computing...
                  </>
                ) : (
                  "Calculate"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Method 1: Series Approximation */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 text-2xl">Method 1: Series Approximation</CardTitle>
                <CardDescription className="text-gray-600">
                  Direct computation using infinite series ζ(n) = Σ(1/k^n)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Result */}
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{result.value.toFixed(45)}</div>
                  {knownValue && (
                    <div className="text-gray-600">
                      Known as: <span className="text-gray-800 font-semibold">{knownValue.name}</span>
                    </div>
                  )}
                </div>

                {/* Mathematical Explanation */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Computation Method</h3>
                  <div className="space-y-4">
                    <div className="text-gray-700">The Riemann zeta function for odd integers is defined as:</div>

                    {/* Main Formula */}
                    <div className="text-center bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <div className="text-2xl text-gray-800 mb-2">ζ({result.n}) =</div>
                      <div className="flex items-center justify-center gap-2 text-xl text-gray-800">
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            1<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+</div>
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            2<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+</div>
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            3<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+</div>
                        <div className="flex flex-col items-center">
                          <div>1</div>
                          <div className="border-t border-gray-400 w-8"></div>
                          <div>
                            4<sup>{result.n}</sup>
                          </div>
                        </div>
                        <div>+ ...</div>
                      </div>
                    </div>

                    {/* Individual Terms */}
                    <div className="text-gray-700 text-center mb-3">First few terms:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((k) => (
                        <div key={k} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
                          <div className="text-lg text-gray-800 mb-2">
                            <div className="flex flex-col items-center">
                              <div className="text-2xl">1</div>
                              <div className="border-t border-gray-400 w-6 my-1"></div>
                              <div className="text-2xl">
                                {k}
                                <sup>{result.n}</sup>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">= {(1 / Math.pow(k, result.n)).toFixed(6)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-gray-700 text-center text-sm mt-4">
                      Computed using partial sums with 2000 terms for high precision.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Method 2: Special Formula */}
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-gray-900 text-2xl">Method 2: Analytical Reconstruction of ζ(2n+1) from ζ(2n)</CardTitle>
                <CardDescription className="text-gray-600">
                  Using an even–to–odd zeta mapping based on Euler–Bernoulli relations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
{specialResult && typeof specialResult === "object" && (
  <>
{/* Cek symbolicResult */}
{specialResult.symbolicResult && (
  <div className="bg-gray-900 text-white rounded-lg p-6 border border-gray-700 relative">

    <div className="text-lg font-mono mb-4 text-center">
      ζ({result.n}) =
    </div>

    {/* ✅ Scrollable container with hidden scrollbar and fade edges */}
    <div className="relative w-full overflow-x-auto scrollbar-hide">

      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-gray-900 to-transparent"></div>
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-gray-900 to-transparent"></div>

      <div className="min-w-max px-6">
        <BlockMath math={specialResult.symbolicResult} />
      </div>
    </div>
  </div>
)}


    {/* Cek numericValue */}
    {Number.isFinite(specialResult.numericValue) && (
      <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {specialResult.numericValue.toFixed(45)}
        </div>
        <div className="text-gray-600 text-sm">Computed using backend FastAPI</div>
      </div>
    )}

    {/* Cek components */}
    {Array.isArray(specialResult.components) && (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Formula Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialResult.components.map((component, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600 mb-1">{component.name}</div>
              <div className="font-mono text-lg text-gray-800 mb-1">
                {component.symbolic}
              </div>
              <div className="text-sm text-gray-600">
                ≈{" "}
                {Number.isFinite(component.value)
                  ? component.value.toFixed(45)
                  : "Invalid"}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </>
)}



              </CardContent>
            </Card>
          </div>
        )}

        {/* Convergence Visualization */}
        {result && (
          <Collapsible open={isConvergenceOpen} onOpenChange={setIsConvergenceOpen}>
            <Card className="bg-white border-gray-200 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900">Series Convergence</CardTitle>
                      <CardDescription className="text-gray-600">
                        Visualize how partial sums converge to ζ({result.n})
                      </CardDescription>
                    </div>
                    {isConvergenceOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="h-80">
                    <ChartContainer
                      config={{
                        partialSum: { label: "Partial Sum", color: "#374151" },
                      }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={result.convergenceData}
    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
  >
    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
    <XAxis
      dataKey="term"
      fontSize={12}
      tickLine={false}
      axisLine={false}
    />
    <YAxis
      fontSize={12}
      tickLine={false}
      axisLine={false}
      domain={["dataMin - 0.01", "dataMax + 0.01"]}
    />
    <ChartTooltip content={<ChartTooltipContent />} />

    <Line
      type="monotone"
      dataKey="partialSum"
      stroke="#374151"
      strokeWidth={2}
      dot={false}
      isAnimationActive={true}
    />
  </LineChart>
</ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    The series converges rapidly for larger values of n. Each point shows the cumulative sum up to that
                    term.
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pb-8">
          <p>Built with modern web technologies • Calculations use series approximation with 2000 terms</p>
        </div>
      </div>
    </div>
  )
}
