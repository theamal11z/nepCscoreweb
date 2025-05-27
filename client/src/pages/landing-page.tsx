import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, User, Shield, Zap, TrendingUp, Users, Trophy, Smartphone, Wifi, Download, Star } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white dark:bg-card shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">nepCscore</div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-8">
                  <Link href="/" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                    Home
                  </Link>
                  <Link href="/about" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                    About
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="default">Login</Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Nepal's Premier <span className="text-white">Cricket</span> Ecosystem
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Connect fans, organize matches, track statistics, and build the future of cricket in Nepal. Join thousands of cricket enthusiasts across the nation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                    Start Your Journey
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold">2,500+</div>
                  <div className="text-gray-300">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">150+</div>
                  <div className="text-gray-300">Matches Played</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">75+</div>
                  <div className="text-gray-300">Teams</div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Cricket match in progress" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Features */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Built for Every Cricket Enthusiast</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're a passionate fan, dedicated organizer, ambitious player, or platform admin, nepCscore has the tools you need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Fan Card */}
            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Fans</h3>
                <p className="text-muted-foreground mb-6">Follow your favorite teams, get live updates, and engage with the cricket community.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Live Score Updates
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Match Reactions & Polls
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Player Following
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Team Statistics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Organizer Card */}
            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Organizers</h3>
                <p className="text-muted-foreground mb-6">Create and manage matches with professional-grade tools and analytics.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Match Creation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Live Score Entry
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Team Management
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Player Rosters
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Player Card */}
            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <User className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Players</h3>
                <p className="text-muted-foreground mb-6">Track your performance, analyze statistics, and grow your cricket career.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Performance Stats
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Match History
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Team Applications
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Career Analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Admin Card */}
            <Card className="hover-lift">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="text-white text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Admins</h3>
                <p className="text-muted-foreground mb-6">Oversee platform operations, manage users, and ensure quality standards.</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    User Management
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Role Assignment
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Content Moderation
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Platform Analytics
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Match Experience */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Real-Time Match Experience</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Experience cricket like never before with our live scoring system, real-time updates, and immersive match visualization.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <Zap className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Ball-by-Ball Updates</h4>
                    <p className="text-muted-foreground">Get instant updates for every ball bowled</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Live Statistics</h4>
                    <p className="text-muted-foreground">Real-time player and team performance metrics</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <Users className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Community Engagement</h4>
                    <p className="text-muted-foreground">React, comment, and engage with fellow fans</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted rounded-2xl p-8">
              {/* Live Match Card */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                      <Badge variant="destructive">LIVE</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">T20 Match</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg mr-3"></div>
                        <div>
                          <div className="font-semibold">Kathmandu Warriors</div>
                          <div className="text-sm text-muted-foreground">156/4 (18.2)</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">vs</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-500 rounded-lg mr-3"></div>
                        <div>
                          <div className="font-semibold">Pokhara Thunder</div>
                          <div className="text-sm text-muted-foreground">112/7 (15.4)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Last Ball</div>
                    <div className="font-medium">R. Sharma bowled by S. Tamang - OUT!</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-sm text-muted-foreground">Sixes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">18</div>
                    <div className="text-sm text-muted-foreground">Fours</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">8.7</div>
                    <div className="text-sm text-muted-foreground">Run Rate</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-First Showcase */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative max-w-sm mx-auto">
                {/* Mobile Mockup */}
                <div className="bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="bg-primary text-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">nepCscore</div>
                        <div className="w-4 h-4 bg-white bg-opacity-20 rounded"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="bg-gray-100 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="destructive" className="text-xs">LIVE</Badge>
                          <span className="text-xs text-gray-500">T20</span>
                        </div>
                        <div className="text-sm font-medium mb-1">Kathmandu vs Pokhara</div>
                        <div className="text-xs text-primary">KTM: 145/6 (17.2 ov)</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Recent Matches</span>
                          <div className="w-3 h-3 text-gray-400">→</div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Player Stats</span>
                          <div className="w-3 h-3 text-gray-400">→</div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Team Rankings</span>
                          <div className="w-3 h-3 text-gray-400">→</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-foreground mb-6">Built for Nepal's Connectivity</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Optimized for mobile networks across rural and urban Nepal. Fast loading, offline capability, and minimal data usage without compromising on features.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Smartphone className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Mobile-First Design</h4>
                    <p className="text-muted-foreground">Every feature optimized for mobile devices with touch-friendly interfaces and intuitive navigation.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Wifi className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Low Bandwidth Friendly</h4>
                    <p className="text-muted-foreground">Efficient data usage and progressive loading ensure smooth experience even on 2G connections.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Download className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Offline Capability</h4>
                    <p className="text-muted-foreground">View cached match data and player statistics even when connectivity is limited.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics & Impact */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Growing Cricket Community</h2>
            <p className="text-xl text-muted-foreground">Building the future of cricket in Nepal, one match at a time</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">1,250</div>
              <div className="text-muted-foreground">Registered Players</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">342</div>
              <div className="text-muted-foreground">Matches Organized</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">89</div>
              <div className="text-muted-foreground">Active Teams</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">47</div>
              <div className="text-muted-foreground">Districts Reached</div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <img 
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Cricket stadium crowd" 
              className="rounded-xl shadow-lg"
            />
            <img 
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Young cricket players training" 
              className="rounded-xl shadow-lg"
            />
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Cricket team celebrating victory" 
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">What Our Community Says</h2>
            <p className="text-xl text-muted-foreground">Hear from players, organizers, and fans who are building Nepal's cricket future</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "nepCscore has transformed how we organize cricket in our community. The live scoring feature is incredible and keeps all our fans engaged throughout the match."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-foreground">Ramesh Thapa</div>
                    <div className="text-sm text-muted-foreground">Match Organizer, Pokhara</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 2 */}
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "As a player, I love tracking my performance and seeing detailed statistics. It's helping me identify areas to improve and showcase my skills to potential teams."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-foreground">Sita Rai</div>
                    <div className="text-sm text-muted-foreground">Player, Chitwan Warriors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial 3 */}
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">
                    "The mobile app works perfectly even in our village with limited internet. I can follow all matches and support my favorite teams from anywhere in Nepal."
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-500 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold text-foreground">Krishna Sharma</div>
                    <div className="text-sm text-muted-foreground">Cricket Fan, Mustang</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Ready to Join Nepal's Cricket Revolution?</h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            Whether you're a fan, player, organizer, or admin, nepCscore has everything you need to be part of Nepal's growing cricket ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Setup</h3>
              <p className="text-red-100">Get started in under 5 minutes with our streamlined onboarding process.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Community</h3>
              <p className="text-red-100">Connect with thousands of cricket enthusiasts across Nepal.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Grow Together</h3>
              <p className="text-red-100">Help build the future of cricket in Nepal while advancing your own goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="text-3xl font-bold text-primary mb-4">nepCscore</div>
              <p className="text-gray-300 mb-6 max-w-md">
                Building Nepal's premier cricket ecosystem, connecting fans, players, organizers, and communities across the nation.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors">For Fans</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">For Organizers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">For Players</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">For Admins</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 nepCscore. All rights reserved.</p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">Made with ❤️ for Nepal's Cricket Community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
