import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Loader } from '../../components/ui/Loader'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../context/AuthContext'
import { analyzeFabricImage, uploadImageToSupabase, addFabric } from '../../lib/fabricApi'
import { useFabric } from '../../context/FabricContext'
import { motion } from 'framer-motion'
import { ImageIcon, CheckCircle2 } from 'lucide-react'

export const UploadFabric = () => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    pricePerMeter: '',
    image: null,
    imagePreview: null,
  })
  
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const { user } = useAuth()
  const { addFabric: addFabricToContext } = useFabric()
  const navigate = useNavigate()

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, image: file, imagePreview: reader.result })
    }
    reader.readAsDataURL(file)

    // Analyze image first (using Flask backend)
    setAnalyzing(true)
    try {
      const response = await analyzeFabricImage(file)
      
      // Parse the AI response
      const generatedText = response.generated_text || ''
      
      // Extract info from text
      const analysis = {
        fabricType: extractFabricType(generatedText) || 'Cotton',
        pattern: extractPattern(generatedText) || 'Solid',
        colors: extractColors(generatedText) || ['#4A5568'],
        confidence: 0.85,
      }
      
      setAiAnalysis(analysis)
      showToast('Fabric analyzed successfully!', 'success')
    } catch (error) {
      console.error('Error analyzing image:', error)
      showToast('Could not analyze fabric. Try another image.', 'error')
      setAiAnalysis(null)
    } finally {
      setAnalyzing(false)
    }
  }

  // Helper functions to parse AI response
  const extractFabricType = (text) => {
    const types = ['cotton', 'silk', 'polyester', 'linen', 'wool', 'denim']
    const lowerText = text.toLowerCase()
    return types.find(type => lowerText.includes(type)) || null
  }

  const extractPattern = (text) => {
    const patterns = ['floral', 'striped', 'checkered', 'polka', 'geometric', 'solid']
    const lowerText = text.toLowerCase()
    return patterns.find(pattern => lowerText.includes(pattern)) || null
  }

  const extractColors = (text) => {
    // This is a placeholder - in production, your backend should return actual color codes
    // For now, return some default colors
    return ['#4A5568', '#718096', '#A0AEC0']
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.image) {
      showToast('Please upload an image', 'error')
      return
    }

    if (!user) {
      showToast('Please login to upload fabrics', 'error')
      return
    }

    setSubmitting(true)
    try {
      // Upload image to Supabase Storage
      let imageUrl = formData.imagePreview
      
      if (formData.image) {
        showToast('Uploading image...', 'info')
        const uploadResult = await uploadImageToSupabase(formData.image, user.id)
        imageUrl = uploadResult.url
      }

      const fabricData = {
        name: formData.name,
        quantity: parseFloat(formData.quantity),
        pricePerMeter: parseFloat(formData.pricePerMeter),
        imageUrl: imageUrl,
        fabricType: aiAnalysis?.fabricType || 'Unknown',
        pattern: aiAnalysis?.pattern || 'Unknown',
        colors: aiAnalysis?.colors || [],
        vendorId: user.id,
        vendorName: user.name || user.email,
      }

      const response = await addFabric(fabricData)
      
      // Transform response to match frontend format
      const transformedFabric = {
        id: response.id,
        name: response.name,
        quantity: response.quantity,
        pricePerMeter: response.price_per_meter,
        imageUrl: response.image_url,
        fabricType: response.fabric_type,
        pattern: response.pattern,
        colors: response.colors || [],
        vendorId: response.vendor_id,
        vendorName: response.vendor_name,
      }
      
      addFabricToContext(transformedFabric)
      showToast('Fabric uploaded successfully!', 'success')
      
      // Reset form
      setFormData({
        name: '',
        quantity: '',
        pricePerMeter: '',
        image: null,
        imagePreview: null,
      })
      setAiAnalysis(null)
      
      // Navigate to listings
      setTimeout(() => navigate('/vendor/listings'), 1500)
    } catch (error) {
      console.error('Error submitting fabric:', error)
      showToast(error.message || 'Failed to upload fabric. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-8">Upload New Fabric</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Fabric Image</CardTitle>
              <CardDescription>Upload an image to analyze fabric properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {formData.imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={formData.imagePreview}
                      alt="Fabric preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({ ...formData, image: null, imagePreview: null })
                        setAiAnalysis(null)
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {analyzing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader size="sm" />
                  <span>Analyzing fabric...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          {aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Detected Fabric Type</Label>
                    <div className="mt-1 text-lg font-semibold capitalize">
                      {aiAnalysis.fabricType}
                    </div>
                  </div>

                  <div>
                    <Label>Detected Pattern</Label>
                    <div className="mt-1 text-lg font-semibold capitalize">
                      {aiAnalysis.pattern}
                    </div>
                  </div>

                  <div>
                    <Label>Dominant Colors</Label>
                    <div className="mt-2 flex gap-2">
                      {aiAnalysis.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-md border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Fabric Details Form */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Fabric Details</CardTitle>
            <CardDescription>Provide additional information about your fabric</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Fabric Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Cotton Twill"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (meters) *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerMeter">Price per Meter ($) *</Label>
                  <Input
                    id="pricePerMeter"
                    name="pricePerMeter"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerMeter}
                    onChange={handleChange}
                    placeholder="25.00"
                    required
                  />
                </div>
              </div>

              {aiAnalysis && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold">AI Detected Information (Read-only)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fabric Type</Label>
                      <Input
                        value={aiAnalysis.fabricType}
                        readOnly
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label>Pattern</Label>
                      <Input
                        value={aiAnalysis.pattern}
                        readOnly
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting || !formData.image}>
                {submitting ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Uploading...</span>
                  </>
                ) : (
                  'Submit Fabric Listing'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

