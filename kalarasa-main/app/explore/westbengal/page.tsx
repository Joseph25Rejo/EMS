"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/navbar';

export default function WestBengalPage() {
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
            Explore West Bengal
          </h1>
          
          {/* Pattachitra Section */}
          <div className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left side - Image */}
              <div className="flex-shrink-0">
                <img 
                  src="wb1.jpg" 
                  alt="Bengal Pattachitra" 
                  className="w-[400px] h-[300px] object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-[400px] h-[300px] bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center">
                          <span class="text-white font-semibold text-center">Bengal<br/>Pattachitra</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              
              {/* Right side - Content */}
              <div className="flex-1">
                <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
                  Pattachitra and Scroll Paintings
                </h2>
                <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed">
                  Pattachitra, meaning 'picture on cloth', is a traditional art form of West Bengal, dating back to the 13th century. These intricate scroll paintings are made on cloth or dried palm leaves using natural colors. The themes are usually mythological, especially stories of Lord Jagannath, Radha-Krishna, and scenes from the Ramayana and Mahabharata. The artists, called 'Chitrakars', use fine brushwork and vibrant colors, with a distinctive style of elongated eyes and stylized figures. The art form is particularly associated with the Kalighat and Midnapore regions.
                </p>
              </div>
            </div>
          </div>
          
          {/* Terracotta Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Terracotta Temples and Pottery
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              West Bengal is famous for its terracotta temples, especially in Bishnupur, which was the capital of the Malla kings. These temples, built between the 16th and 19th centuries, feature intricate terracotta panels depicting scenes from the epics, daily life, and floral patterns. The Bankura horse, a traditional terracotta craft, has become a symbol of Bengali folk art. The state also has a rich tradition of terracotta pottery, with unique styles like the Bankura horse, Dhokra metal casting, and the distinctive black pottery of Nabadwip.
            </p>
          </div>
          
          {/* Second Image */}
          <div className="mb-12 flex justify-center">
            <img 
              src="wb2.jpg" 
              alt="Kalighat Painting" 
              className="w-[400px] h-[300px] object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-[400px] h-[300px] bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span class="text-white font-semibold text-center">Kalighat<br/>Painting</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
          
          {/* Kalighat Paintings Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Kalighat Paintings
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Originating in the 19th century around the Kalighat temple in Kolkata, these paintings were created by the 'patuas' (scroll painters) who transitioned to creating individual paintings on paper. Kalighat paintings are characterized by bold outlines, vibrant colors, and a satirical take on contemporary society. The subjects range from Hindu gods and goddesses to social commentary on the British Raj and the emerging middle class. The style had a significant influence on modern Indian art and was one of the first forms of mass-produced art in India.
            </p>
          </div>
          
          {/* Textiles Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Textiles and Handloom
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              West Bengal is renowned for its handloom textiles, particularly the famous Baluchari and Jamdani saris. The Baluchari saris from Murshidabad feature elaborate brocade work with scenes from the Mahabharata and Ramayana. The Dhaniakhali cotton saris are known for their fine texture and durability. The state is also famous for its Kantha embroidery, where old saris and dhotis are layered and stitched together with running stitches to create beautiful patterns, often telling stories or depicting scenes from daily life.
            </p>
          </div>
          
          {/* Folk and Tribal Art Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Folk and Tribal Art
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              West Bengal has a rich tradition of folk and tribal art forms. The Santhal tribal paintings, characterized by simple lines and earthy colors, depict daily life and nature. The Chau dance of Purulia, a martial art form with elaborate masks, is recognized by UNESCO as an Intangible Cultural Heritage. The Dokra metal craft, practiced by the Dhokra Damar tribes, produces beautiful metal figurines using the lost-wax casting technique. The Patachitra scroll paintings by the Patua community combine visual art with storytelling through song.
            </p>
          </div>
          
          {/* Performing Arts Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Performing Arts and Puppetry
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              West Bengal has a vibrant tradition of performing arts. The Jatra is a popular folk theater form with elaborate costumes and dramatic performances. The state is also known for its traditional puppetry, particularly the rod puppets of West Bengal, which are large puppets (3-4 feet tall) operated by rods from below the stage. The puppets are beautifully dressed and used to perform stories from mythology and social themes. The state is also the birthplace of Rabindra Sangeet and Nazrul Geeti, two important genres of Indian music.
            </p>
          </div>
          
        </div>
    </>
  );
}