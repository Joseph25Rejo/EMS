"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/navbar';
export default function RajasthanPage() {
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
            Explore Rajasthan
          </h1>
          
          {/* Miniature Paintings Section */}
          <div className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left side - Image */}
              <div className="flex-shrink-0">
                <img 
                  src="/rj1.jpg" 
                  alt="Rajasthani Miniature Painting" 
                  className="w-[400px] h-[300px] object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-[400px] h-[300px] bg-gradient-to-br from-amber-400 to-red-500 rounded-lg flex items-center justify-center">
                          <span class="text-white font-semibold text-center">Rajasthani<br/>Miniature Art</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              
              {/* Right side - Content */}
              <div className="flex-1">
                <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
                  Miniature Paintings
                </h2>
                <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed">
                  Rajasthani miniature paintings are among the most famous art forms of India, known for their intricate details, vibrant colors, and themes of royal processions, hunting scenes, and Hindu epics. The major schools include Mewar, Marwar, Hadoti, and Dhundar, each with distinct styles. These paintings often feature bold colors, fine brushwork, and elaborate ornamentation, depicting scenes from the life of Lord Krishna, Ragamala series, and royal portraits.
                </p>
              </div>
            </div>
          </div>
          
          {/* Blue Pottery Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Blue Pottery
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Jaipur's blue pottery is a unique craft that originated in Persia and was brought to India by Mughal invaders. Made from a special dough of quartz stone powder, powdered glass, Multani mitti, borax, and gum, it is the only pottery in the world that is not made from clay. The distinctive blue color comes from cobalt oxide, and the designs often feature Persian-inspired floral and geometric patterns. Items include vases, plates, and tiles, all with a distinctive turquoise blue glaze.
            </p>
          </div>
          
          {/* Second Image */}
          <div className="mb-12 flex justify-center">
            <img 
              src="/rj2.jpg" 
              alt="Rajasthani Blue Pottery" 
              className="w-[400px] h-[300px] object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-[400px] h-[300px] bg-gradient-to-br from-blue-300 to-teal-500 rounded-lg flex items-center justify-center">
                      <span class="text-white font-semibold text-center">Blue<br/>Pottery</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
          
          {/* Textiles and Embroidery Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Textiles and Embroidery
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Rajasthan is famous for its tie-dye (Bandhani) fabrics, block printing (Sanganeri and Bagru prints), and gota patti work. The traditional Rajasthani embroidery styles include Zari, Zardosi, Gota, and Phulkari. The region is also known for its vibrant leheriya (wave-patterned) and mothra (checkered) tie-dye fabrics. Each region has its specialty, like the famous Kota Doria fabrics from Kota and the fine muslin from Chanderi.
            </p>
          </div>
          
          {/* Jewelry Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Jewelry and Gem Cutting
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Jaipur is known as the 'Pink City' and is a major center for jewelry making and gem cutting. The city's jewelers are famous for their kundan and meenakari work, where precious stones are set in gold and decorated with enamel work. The traditional Rajasthani jewelry includes the borla (maang tikka), rakhdi (head ornament), and bajuband (armlet), often featuring intricate designs with precious and semi-precious stones.
            </p>
          </div>
          
          {/* Puppetry Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Puppetry and Folk Art
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kathputli (puppetry) is a traditional form of entertainment in Rajasthan, where puppeteers use string puppets to narrate folk tales and legends. The puppets are made from wood, cotton, and cloth, and are colorfully dressed in traditional Rajasthani attire. The state is also known for its Phad paintings, which are large cloth scrolls painted with vegetable colors, depicting the life of local deities and heroes, particularly Pabuji and Devnarayan.
            </p>
          </div>
          
          {/* Architecture Section */}
          <div className="mb-12">
            <h2 className="font-['Instrument_Serif'] text-[32px] text-black mb-4">
              Architecture and Stone Carving
            </h2>
            <p className="font-['Instrument_Serif'] text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Rajasthan's architecture is a blend of Rajput and Mughal styles, featuring intricate jali work, chhatris (domed pavilions), and havelis (mansions) with frescoed walls. The state is famous for its stepwells (baoris), forts, and palaces made from pink sandstone and white marble. The stone carving tradition is most evident in the Dilwara Temples of Mount Abu, known for their exquisite marble carvings, and the intricate jharokhas (overhanging balconies) of Jaisalmer's havelis.
            </p>
          </div>
          
        </div>
    </>
  );
}