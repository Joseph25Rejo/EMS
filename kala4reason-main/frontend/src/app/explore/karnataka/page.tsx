"use client"
import React, { useEffect } from 'react';
import BackButton from '@/components/BackButton';
import Navbar from '@/components/navbar';

export default function KarnatakaPage() {
  // Add a cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup function
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <Navbar />
      
      {/* Green Background Section */}
      <div 
        className="w-full h-[200px] overflow-hidden relative" 
        style={{ backgroundColor: '#A2FF9C' }}
      >
        <img 
          src="/right.svg" 
          alt="Decoration"
          className="absolute right-0 h-full object-cover"
        />
      </div>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton to="/" label="Back to Home" />
          
          {/* Main Heading */}
          <h1 className="font-inter text-[48px] font-bold text-black mb-12">
            Explore Karnataka
          </h1>
          
          {/* Paintings Section */}
          <div className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left side - Image */}
              <div className="flex-shrink-0">
                <img 
                  src="/ka1.jpg" 
                  alt="Karnataka Art 1" 
                  className="w-[400px] h-[300px] object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23A2FF9C%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%3EKarnataka%20Art%201%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
              </div>
              
              {/* Right side - Content */}
              <div className="flex-1">
                <h2 className="font-instrument-serif text-[32px] text-black mb-4">
                  Paintings
                </h2>
                <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed">
                  The Mysore style of painting developed under the Wodeyars of Mysore in the 17th-18th centuries. These paintings are known for their fine lines, muted colors, use of gesso work with gold foil, and themes from Hindu mythology. Subjects often include gods, goddesses, and scenes from the Ramayana, Mahabharata, and Puranas. Apart from this, Karnataka also has ancient mural and rock paintings, particularly in the caves of Badami and the monuments at Hampi.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sculpture and Stone Carving Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Sculpture and Stone Carving
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Karnataka's temples reflect some of the finest stone carving traditions of India. The Hoysala temples at Belur, Halebidu, and Somnathpur are famous for their minute soapstone carvings. The Chalukyan sites at Badami, Aihole, and Pattadakal feature remarkable rock-cut architecture and sculpture. The Vijayanagara ruins at Hampi showcase the grandeur of medieval stone art in Hampi, representing both religious devotion and artistic achievement.
            </p>
          </div>
          
          {/* Second Image */}
          <div className="mb-12 flex justify-center">
            <img 
              src="/ka2.jpg" 
              alt="Karnataka Art 2" 
              className="w-[400px] h-[300px] object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23A2FF9C%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%3EKarnataka%20Art%202%3C%2Ftext%3E%3C%2Fsvg%3E';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-[400px] h-[300px] bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <span class="text-white font-semibold text-lg text-center">Karnataka<br/>Sculpture</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
          
          {/* Metal Crafts Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Metal Crafts
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              The most famous metal craft of Karnataka is Bidriware, originating in Bidar during the Bahmani Sultanate in the 14th century. It is created from a blackened alloy of zinc and copper inlaid with silver designs, used for vases, bowls, plates, and ornamental items. Karnataka is also known for bronze casting using the lost wax method, producing idols of deities and temple bells of remarkable quality.
            </p>
          </div>
          
          {/* Woodwork Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Woodwork
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Mysore is renowned for its rosewood inlay work, where rosewood is decorated with ivory or substitutes to make furniture, wall panels, and decorative objects. Another important craft is sandalwood carving, centered in Mysore. Artisans carve figurines of gods, elephants, and boxes with remarkable skill, and the fragrance of sandalwood makes these pieces highly valued.
            </p>
          </div>
          
          {/* Textiles and Weaving Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Textiles and Weaving
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Karnataka has several distinctive textile traditions. The ilkal sarees of Bagalkot district are woven from cotton and silk with distinctive patterns and borders. Mysore silk sarees are famous for their pure silk, rich colors, and intricate gold zari, a tradition supported by the Mysore Silk Factory. Kasuti embroidery is a folk art practiced by women, involving detailed motifs of temples, chariots, animals, and geometric patterns, stitched in such a way that both sides of the fabric look identical.
            </p>
          </div>
          
          {/* Folk and Tribal Crafts Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Folk and Tribal Crafts
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Togalu Gombeyaata, the leather shadow puppetry of northern Karnataka, uses colored puppets made from treated goat skin to narrate epics like the Ramayana and Mahabharata. Known as the "Tolu" puppets, because of their leather base, these dolls are eco-friendly and brightly colored. During the Dasara festival, traditional dolls are displayed in homes in what is called Gombe Habba.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}