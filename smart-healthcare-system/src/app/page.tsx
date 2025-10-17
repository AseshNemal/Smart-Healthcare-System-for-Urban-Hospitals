export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-8">
        <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">🏥 Welcome to Smart Healthcare</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
          Your Health, Our Priority
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg leading-relaxed">
          Experience modern healthcare management designed for urban hospitals. 
          Connect with top specialists, manage appointments seamlessly, and access your medical records securely—all in one place.
        </p>
      </section>

      {/* Stats/Insights Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: "👨‍⚕️", value: "50+", label: "Specialist Doctors" },
          { icon: "🏥", value: "15+", label: "Medical Services" },
          { icon: "⭐", value: "98%", label: "Patient Satisfaction" },
          { icon: "🕐", value: "24/7", label: "Emergency Support" },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/30">
            <div className="text-4xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Main Features Cards */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: "👨‍⚕️",
            title: "Find Doctors",
            desc: "Browse through our network of experienced specialists across various medical fields. View detailed profiles, check real-time availability, and choose the right doctor for your needs.",
            href: "/doctors",
            color: "blue",
          },
          {
            icon: "📅",
            title: "Book Appointments",
            desc: "Schedule your hospital visits with ease. Select preferred time slots, receive instant confirmations, and manage all your appointments from your personal dashboard.",
            href: "/dashboard",
            color: "cyan",
          },
          {
            icon: "📄",
            title: "Medical Records",
            desc: "Access your complete health history securely. View test results, prescriptions, and medical reports anytime, anywhere with our encrypted digital storage system.",
            href: "/records",
            color: "indigo",
          },
        ].map((feature) => (
          <a 
            key={feature.title} 
            href={feature.href} 
            className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 p-8 bg-white dark:bg-gray-800/50 hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 dark:from-${feature.color}-900/30 dark:to-${feature.color}-800/30 mb-4 text-3xl`}>
              {feature.icon}
            </div>
            <h3 className="font-bold mb-3 text-xl text-gray-900 dark:text-gray-100">{feature.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{feature.desc}</p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
              Learn more 
              <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </a>
        ))}
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-900/10 dark:via-cyan-900/10 dark:to-indigo-900/10 rounded-3xl p-8 md:p-12 border border-blue-100 dark:border-blue-800/30">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
          Why Choose Our Platform?
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          We combine cutting-edge technology with compassionate care to deliver the best healthcare experience
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "🔒",
              title: "Secure & Private",
              desc: "Your medical data is encrypted and protected with industry-leading security standards"
            },
            {
              icon: "⚡",
              title: "Fast & Efficient",
              desc: "Book appointments in seconds and get instant confirmations with our streamlined process"
            },
            {
              icon: "💳",
              title: "Easy Payments",
              desc: "Multiple payment options including credit cards and insurance for your convenience"
            },
            {
              icon: "📱",
              title: "Mobile Friendly",
              desc: "Access your healthcare portal from any device, anytime, anywhere"
            },
            {
              icon: "🔔",
              title: "Smart Reminders",
              desc: "Never miss an appointment with automated notifications and reminders"
            },
            {
              icon: "🌟",
              title: "Quality Care",
              desc: "Connect with board-certified specialists committed to your health and wellbeing"
            },
          ].map((benefit) => (
            <div key={benefit.title} className="flex gap-4 p-5 rounded-xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-blue-100 dark:border-blue-800/20">
              <div className="text-3xl flex-shrink-0">{benefit.icon}</div>
              <div>
                <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{benefit.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 rounded-3xl text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of patients who trust us with their healthcare journey
        </p>
        <div className="flex gap-4 items-center justify-center flex-wrap">
          <a 
            href="/appointments" 
            className="px-8 py-3.5 rounded-xl bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg"
          >
            📅 Book Your First Appointment
          </a>
          <a 
            href="/doctors" 
            className="px-8 py-3.5 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-all"
          >
            👨‍⚕️ Explore Our Doctors
          </a>
        </div>
      </section>
    </div>
  );
}
