"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/navbar';
import Image from 'next/image';

export default function KarnatakaPage() {
  const router = useRouter();

  return (
    <>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <div className="bg-white min-h-screen">
        <Navbar/>
        
                {/* Green Background Section */}
                  <div 
                    className="left-0 w-full h-[200px] overflow-hidden relative" 
                    style={{ backgroundColor: '#A2FF9C' }}
                  >
                    <div className="relative w-full h-full">
                      {/* Left Text */}
                      <div className="absolute left-[50px] top-1/2 transform -translate-y-1/2 max-w-[500px] z-10">
                        <h2 className="font-['Instrument_Serif'] text-5xl leading-tight text-black">
                          Discover art from community<br />
                          artists all over India.
                        </h2>
                      </div>
        
                      {/* Right SVG */}
                      <div className="absolute right-[20px] top-1/2 transform -translate-y-[40%] z-0">
                        <Image 
                          src="/right.svg" 
                          alt="Decoration" 
                          width={900}
                          height={900}
                          className="h-[900px] w-[900px]"
                          onLoad={() => console.log('Image loaded successfully')}
                          onError={(e) => console.error('Image failed to load:', e)}
                        />
                      </div>
                    </div>
                  </div>
        
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 py-8">
          
          {/* Main Heading */}
          <h1 className="font-['Inter'] text-[48px] font-bold text-black mb-12">
            Explore Karnataka
          </h1>
          
          {/* Paintings Section */}
          <div className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left side - Image */}
              <div className="flex-shrink-0">
                <div className="relative w-[400px] h-[300px]">
                  <Image 
                    src="/ka1.jpg" 
                    alt="Karnataka Painting" 
                    fill
                    className="object-cover rounded-lg"
                    onError={() => {
                      const element = document.getElementById('painting-fallback');
                      if (element) {
                        element.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                            <span class="text-white font-semibold text-lg text-center">Karnataka<br/>Painting</span>
                          </div>
                        `;
                      }
                    }}
                  />
                  <div id="painting-fallback"></div>
                </div>
              </div>
              
              {/* Right side - Content */}
              <div className="flex-1">
                <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
                  Paintings
                </h2>
                <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed">
                  The Mysore style of painting developed under the Wodeyars of Mysore in the 17th-18th centuries. These paintings are known for their fine lines, muted colors, use of gesso work with gold foil, and themes from Hindu mythology. Subjects often include gods, goddesses, and scenes from the Ramayana, Mahabharata, and Puranas. Apart from this, Karnataka also has ancient mural and rock paintings, particularly in the caves of Badami and the monuments at Hampi.
                </p>
              </div>
            </div>
          </div>
          
          {/* Sculpture and Stone Carving Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Sculpture and Stone Carving
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Karnataka&apos;s temples reflect some of the finest stone carving traditions of India. The Hoysala temples at Belur, Halebidu, and Somnathpur are famous for their minute soapstone carvings. The Chalukyan sites at Badami, Aihole, and Pattadakal feature remarkable rock-cut architecture and sculpture. The Vijayanagara ruins at Hampi showcase the grandeur of medieval stone art in Hampi, representing both religious devotion and artistic achievement.
            </p>
          </div>
          
          {/* Second Image */}
          <div className="mb-12 flex justify-center">
            <div className="relative w-[400px] h-[300px]">
              <Image 
                src="/ka2.jpg" 
                alt="Karnataka Sculpture" 
                fill
                className="object-cover rounded-lg"
              onError={() => {
                const element = document.getElementById('sculpture-fallback');
                if (element) {
                  element.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <span class="text-white font-semibold text-lg text-center">Karnataka<br/>Sculpture</span>
                    </div>
                  `;
                }
              }}
              />
              <div id="sculpture-fallback"></div>
            </div>
          </div>
          
          {/* Metal Crafts Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Metal Crafts
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              The most famous metal craft of Karnataka is Bidriware, originating in Bidar during the Bahmani Sultanate in the 14th century. It is created from a blackened alloy of zinc and copper inlaid with silver designs, used for vases, bowls, plates, and ornamental items. Karnataka is also known for bronze casting using the lost wax method, producing idols of deities and temple bells of remarkable quality.
            </p>
          </div>
          
          {/* Woodwork Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Woodwork
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Mysore is renowned for its rosewood inlay work, where rosewood is decorated with ivory or substitutes to make furniture, wall panels, and decorative objects. Another important craft is sandalwood carving, centered in Mysore. Artisans carve figurines of gods, elephants, and boxes with remarkable skill, and the fragrance of sandalwood makes these pieces highly valued.
            </p>
          </div>
          
          {/* Textiles and Weaving Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Textiles and Weaving
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Karnataka has several distinctive textile traditions. The ilkal sarees of Bagalkot district are woven from cotton and silk with distinctive patterns and borders. Mysore silk sarees are famous for their pure silk, rich colors, and intricate gold zari, a tradition supported by the Mysore Silk Factory. Kasuti embroidery is a folk art practiced by women, involving detailed motifs of temples, chariots, animals, and geometric patterns, stitched in such a way that both sides of the fabric look identical.
            </p>
          </div>
          
          {/* Folk and Tribal Crafts Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Folk and Tribal Crafts
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Togalu Gombeyaata, the leather shadow puppetry of northern Karnataka, uses colored puppets made from treated goat skin to narrate epics like the Ramayana and Mahabharata. Known as the "Tolu" puppets, because of their leather base, these dolls are eco-friendly and brightly colored. During the Dasara festival, traditional dolls are displayed in homes in what is called Gombe Habba.
            </p>
          </div>
          
        </div>
      </div>
    </>
  );
}