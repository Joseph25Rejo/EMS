"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/navbar';

export default function KeralaPage() {
  const router = useRouter();

  return (
    <>
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
                        <img 
                          src="/right.svg" 
                          alt="Decoration" 
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
            Explore Kerala
          </h1>
          
          {/* Mural Paintings Section */}
          <div className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left side - Image */}
              <div className="flex-shrink-0">
                <img 
                  src="/ke1.jpg" 
                  alt="Kerala Mural Painting" 
                  className="w-[400px] h-[300px] object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-[400px] h-[300px] bg-gradient-to-br from-emerald-400 to-blue-600 rounded-lg flex items-center justify-center">
                          <span class="text-white font-semibold text-center">Kerala<br/>Mural Art</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              
              {/* Right side - Content */}
              <div className="flex-1">
                <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
                  Mural Paintings
                </h2>
                <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed">
                  Kerala's mural paintings date back to the 9th to 12th centuries and are known for their vibrant colors, intricate details, and themes from Hindu mythology. These temple art forms use natural pigments and follow strict iconometric rules. The paintings typically depict scenes from Hindu epics, especially the stories of Lord Krishna, with a distinctive style featuring elongated eyes, elaborate headgear, and rich ornamentation. The Padmanabhapuram Palace and Mattancherry Palace house some of the finest examples of traditional Kerala murals.
                </p>
              </div>
            </div>
          </div>
          
          {/* Theyyam Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Theyyam and Ritual Art
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Theyyam is a popular ritual art form of North Kerala, where performers embody deities through elaborate costumes, makeup, and dance. The face painting and headgears are particularly striking, often taking hours to complete. The art form combines dance, music, and ritual, with each Theyyam representing a particular deity or hero. The vibrant colors used in the makeup are derived from natural sources like turmeric, rice powder, and leaves, creating a dramatic visual effect under torchlight.
            </p>
          </div>
          
          {/* Second Image */}
          <div className="mb-12 flex justify-center">
            <img 
              src="/ke2.jpg" 
              alt="Kathakali Performance" 
              className="w-[400px] h-[300px] object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
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
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Kathakali and Performing Arts
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kathakali is Kerala's classical dance-drama known for its elaborate costumes, detailed makeup, and facial expressions. The art form combines literature, music, painting, acting, and dance. The makeup (chutti) is a distinctive feature, with different colors representing different character types - green for noble heroes, red for evil characters, and black for hunters and forest dwellers. The elaborate headgear, colorful costumes, and detailed facial makeup make Kathakali one of the most visually striking performing arts in the world.
            </p>
          </div>
          
          {/* Wood and Stone Carving Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Wood and Stone Carving
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kerala's wood and stone carvings are integral to its temple architecture. The traditional wood carvers (asari) create intricate sculptures, temple chariots, and furniture using teak, rosewood, and sandalwood. The stone carvings in temples, especially the serpent worship groves (kavus), showcase exquisite craftsmanship. The wood carvings often feature floral patterns, mythological figures, and scenes from epics, with the Padmanabhapuram Palace being a prime example of this craft.
            </p>
          </div>
          
          {/* Textiles and Handicrafts Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Textiles and Handicrafts
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kerala is known for its handloom textiles, particularly the Kasavu sarees with their gold borders, traditionally worn during festivals like Onam. The state also produces fine coir products, including mats and carpets, made from coconut fiber. The traditional craft of making urulis (brass vessels) and the bell metal lamps are other specialties. The Aranmula Kannadi (metal mirror) is a unique handicraft made using a secret metal alloy formula that creates a distortion-free reflection.
            </p>
          </div>
          
          {/* Traditional Architecture Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Traditional Architecture
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kerala's traditional architecture is characterized by sloping roofs, wooden beams, and open courtyards, designed to suit the tropical climate. The nalukettu and ettukettu (traditional houses with four and eight sections respectively) showcase this style. The Padmanabhapuram Palace, with its intricate woodwork and murals, and the Dutch Palace in Mattancherry are excellent examples of traditional Kerala architecture. The temples follow the distinctive Kerala style with gabled roofs, wood carvings, and murals, often surrounded by water bodies.
            </p>
          </div>
          
        </div>
    </>
  );
}