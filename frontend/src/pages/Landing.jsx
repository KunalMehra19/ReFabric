import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Leaf, Users, TrendingUp, CheckCircle } from 'lucide-react'

export const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-beige-50 to-green-50 py-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Turning Textile Waste into{' '}
              <span className="text-primary">Opportunity</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect large textile vendors with small-scale designers and tailors. 
              Buy and sell surplus fabrics sustainably.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Join as Vendor
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline">
                  Join as Buyer
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'For Vendors',
                description: 'Upload your surplus fabrics with AI-powered analysis. Set your prices and reach thousands of buyers.',
                icon: <TrendingUp className="h-8 w-8 text-primary" />,
              },
              {
                title: 'For Buyers',
                description: 'Browse AI-analyzed fabrics with detailed information. Filter by type, color, pattern, and price.',
                icon: <Users className="h-8 w-8 text-primary" />,
              },
              {
                title: 'Sustainable Impact',
                description: 'Reduce textile waste by giving surplus fabrics a new life. Support sustainable fashion.',
                icon: <Leaf className="h-8 w-8 text-primary" />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Impact */}
      <section className="py-20 px-4 bg-green-50/50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Sustainability Impact</h2>
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">Vendors</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                    <div className="text-sm text-muted-foreground">Buyers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                    <div className="text-sm text-muted-foreground">Meters Saved</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">80%</div>
                    <div className="text-sm text-muted-foreground">Waste Reduction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Independent Designer',
                text: 'ReFabric has transformed how I source materials. The AI analysis helps me find exactly what I need.',
              },
              {
                name: 'John Martinez',
                role: 'Textile Vendor',
                text: 'Selling surplus fabric has never been easier. The platform connects us with the right buyers.',
              },
              {
                name: 'Emma Wilson',
                role: 'Tailor',
                text: 'Great prices and quality fabrics. The detailed information makes purchasing decisions easy.',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <CheckCircle key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">&quot;{testimonial.text}&quot;</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

