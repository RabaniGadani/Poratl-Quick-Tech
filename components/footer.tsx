import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-slate-800  text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/Quick%20Tech.png" alt="Quick Tech Logo" className="w-10 h-10" />
              <h3 className="text-lg font-semibold">Quick Tech Institute of Information Technology</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Quick Tech Institute of Information Technology — Empowering students with cutting-edge technology education and skills for the future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/lectures" className="text-gray-300 hover:text-white transition-colors">
                  Online Lectures
                </Link>
              </li>
              <li>
                <Link href="/textbooks" className="text-gray-300 hover:text-white transition-colors">
                  Text Books
                </Link>
              </li>
              <li>
                <Link href="/exam" className="text-gray-300 hover:text-white transition-colors">
                  Exams
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="text-gray-300 hover:text-white transition-colors">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Email: education@quicktech.com</p>
              <p>Phone: +92 21 1234 5678</p>
              <p>Address: Gill Colony Mirpur Mathelo</p>
              <p>Ghotki, Sindh</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-gray-400">
              © 2024 Quick Tech Institute of Information Technology. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
             
              Powered by <Link href="https://www.facebook.com/gadani.baloch.98/" className="underline"> Gadani Essa Baloch </Link>
              
            </p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="text-sm text-gray-400 hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
