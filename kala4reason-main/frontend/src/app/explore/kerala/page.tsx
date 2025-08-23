"use client"
import React, { useEffect } from 'react';
import BackButton from '@/components/BackButton';
import Navbar from '@/components/navbar';

export default function KeralaPage() {
  // Add a cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup function
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
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
            Explore Kerala
          </h1>
          
          {/* Mural Paintings Section */}
          <div className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left side - Image */}
              <div className="flex-shrink-0">
                <img 
                  src="/ke1.jpg" 
                  alt="Kerala Art 1" 
                  className="w-[400px] h-[300px] object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23A2FF9C%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%3EKerala%20Art%201%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
              </div>
              
              {/* Right side - Content */}
              <div className="flex-1">
                <h2 className="font-instrument-serif text-[32px] text-black mb-4">
                  Mural Paintings
                </h2>
                <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed">
                  Kerala's mural paintings date back to the 9th to 12th centuries and are known for their vibrant colors, intricate details, and themes from Hindu mythology. These temple art forms use natural pigments and follow strict iconometric rules. The paintings typically depict scenes from Hindu epics, especially the stories of Lord Krishna, with a distinctive style featuring elongated eyes, elaborate headgear, and rich ornamentation. The Padmanabhapuram Palace and Mattancherry Palace house some of the finest examples of traditional Kerala murals.
                </p>
              </div>
            </div>
          </div>
          
          {/* Theyyam Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Theyyam and Ritual Art
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Theyyam is a popular ritual art form of North Kerala, where performers embody deities through elaborate costumes, makeup, and dance. The face painting and headgears are particularly striking, often taking hours to complete. The art form combines dance, music, and ritual, with each Theyyam representing a particular deity or hero. The vibrant colors used in the makeup are derived from natural sources like turmeric, rice powder, and leaves, creating a dramatic visual effect under torchlight.
            </p>
          </div>
          
          {/* Second Image */}
          <div className="mb-12 flex justify-center">
            <img 
              src="/ke2.jpg" 
              alt="Kerala Art 2" 
              className="w-[400px] h-[300px] object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23A2FF9C%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%3EKerala%20Art%202%3C%2Ftext%3E%3C%2Fsvg%3E';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-[400px] h-[300px] bg-gradient-to-br from-red-500 to-purple-700 rounded-lg flex items-center justify-center">
                      <span class="text-white font-semibold text-center">Kathakali<br/>Performance</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
          
          {/* Kathakali and Performing Arts Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Kathakali and Performing Arts
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kathakali is Kerala's classical dance-drama known for its elaborate costumes, detailed makeup, and facial expressions. The art form combines literature, music, painting, acting, and dance. The makeup (chutti) is a distinctive feature, with different colors representing different character types - green for noble heroes, red for evil characters, and black for hunters and forest dwellers. The elaborate headgear, colorful costumes, and detailed facial makeup make Kathakali one of the most visually striking performing arts in the world.
            </p>
          </div>
          
          {/* Wood and Stone Carving Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Wood and Stone Carving
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kerala's wood and stone carvings are integral to its temple architecture. The traditional wood carvers (asari) create intricate sculptures, temple chariots, and furniture using teak, rosewood, and sandalwood. The stone carvings in temples, especially the serpent worship groves (kavus), showcase exquisite craftsmanship. The wood carvings often feature floral patterns, mythological figures, and scenes from epics, with the Padmanabhapuram Palace being a prime example of this craft.
            </p>
          </div>
          
          {/* Textiles and Handicrafts Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Textiles and Handicrafts
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kerala is known for its handloom textiles, particularly the Kasavu sarees with their gold borders, traditionally worn during festivals like Onam. The state also produces fine coir products, including mats and carpets, made from coconut fiber. The traditional craft of making urulis (brass vessels) and the bell metal lamps are other specialties. The Aranmula Kannadi (metal mirror) is a unique handicraft made using a secret metal alloy formula that creates a distortion-free reflection.
            </p>
          </div>
          
          {/* Traditional Architecture Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Traditional Architecture
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kerala's traditional architecture is characterized by sloping roofs, wooden beams, and open courtyards, designed to suit the tropical climate. The nalukettu and ettukettu (traditional houses with four and eight sections respectively) showcase this style. The Padmanabhapuram Palace, with its intricate woodwork and murals, and the Dutch Palace in Mattancherry are excellent examples of traditional Kerala architecture. The temples follow the distinctive Kerala style with gabled roofs, wood carvings, and murals, often surrounded by water bodies.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
