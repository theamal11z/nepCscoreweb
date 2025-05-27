import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Calendar, User, Shield, Target, Users, Trophy, Globe } from "lucide-react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white dark:bg-card shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="text-2xl font-bold text-primary">nepCscore</div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="default">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About nepCscore</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Building Nepal's premier cricket ecosystem to connect fans, empower organizers, 
            support players, and strengthen communities through the beautiful game of cricket.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                To democratize cricket in Nepal by providing accessible tools for match organization, 
                player development, and community engagement across urban and rural areas.
              </p>
              <p className="text-muted-foreground">
                We believe cricket has the power to unite communities, inspire youth, and showcase 
                Nepal's sporting talent to the world. Through technology, we're making cricket 
                more organized, accessible, and engaging for everyone.
              </p>
            </div>
            
            <div>
              <div className="flex items-center mb-6">
                <Globe className="w-8 h-8 text-primary mr-3" />
                <h2 className="text-3xl font-bold">Our Vision</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                To see Nepal emerge as a recognized cricket nation with a thriving grassroots 
                ecosystem that nurtures talent from every corner of the country.
              </p>
              <p className="text-muted-foreground">
                We envision a future where every cricket enthusiast in Nepal - from the mountains 
                of Mustang to the plains of Terai - can participate in, organize, and follow 
                cricket with professional-grade tools and community support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Community First</h3>
                <p className="text-muted-foreground">
                  Everything we build serves the cricket community. We listen, learn, and evolve based on your needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in every feature, ensuring quality that matches international standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Accessibility</h3>
                <p className="text-muted-foreground">
                  Cricket should be for everyone. We design for all skill levels, devices, and connectivity conditions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously innovate to solve real problems and create new opportunities for cricket growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How nepCscore Works</h2>
            <p className="text-xl text-muted-foreground">
              Four distinct experiences for four types of cricket enthusiasts
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                  <Heart className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">For Fans</h3>
                  <p className="text-muted-foreground">
                    Follow your favorite teams and players, get real-time match updates, 
                    participate in polls and discussions, and stay connected with the cricket community.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                  <Calendar className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">For Organizers</h3>
                  <p className="text-muted-foreground">
                    Create and manage matches, set up tournaments, manage team rosters, 
                    enter live scores with ball-by-ball commentary, and track match statistics.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                  <User className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">For Players</h3>
                  <p className="text-muted-foreground">
                    Track your performance statistics, view detailed match history, 
                    apply for team memberships, and showcase your skills to potential teams.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                  <Shield className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">For Admins</h3>
                  <p className="text-muted-foreground">
                    Manage user approvals, assign roles, moderate content, oversee platform activity, 
                    and generate comprehensive reports for cricket development insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Accessibility */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Nepal</h2>
            <p className="text-xl text-muted-foreground">
              Designed specifically for Nepal's unique connectivity and geographic challenges
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Mobile-First Design</h3>
                <p className="text-muted-foreground">
                  Optimized for mobile devices with touch-friendly interfaces, 
                  ensuring excellent experience on smartphones across price ranges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Low Bandwidth Optimized</h3>
                <p className="text-muted-foreground">
                  Efficient data usage and progressive loading ensure smooth performance 
                  even on 2G connections in remote areas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4">Offline Capability</h3>
                <p className="text-muted-foreground">
                  View cached match data, player statistics, and team information 
                  even when internet connectivity is limited.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join the Movement?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of Nepal's cricket revolution. Whether you're a fan, organizer, player, 
            or administrator, nepCscore has the tools you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold text-primary mb-4 md:mb-0">nepCscore</div>
            <p className="text-gray-400 text-sm">© 2024 nepCscore. Made with ❤️ for Nepal's Cricket Community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
