"use client"
import React, { useEffect } from 'react';
import BackButton from '@/components/BackButton';
import Navbar from '@/components/navbar';

export default function RajasthanPage() {
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
            Explore Rajasthan
          </h1>
          
          {/* Miniature Paintings Section */}
          <div className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left side - Image */}
              <div className="flex-shrink-0">
                <img 
                  src="/rj1.jpg" 
                  alt="Rajasthan Art 1" 
                  className="w-[400px] h-[300px] object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23A2FF9C%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%3ERajasthan%20Art%201%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
              </div>
              
              {/* Right side - Content */}
              <div className="flex-1">
                <h2 className="font-instrument-serif text-[32px] text-black mb-4">
                  Miniature Paintings
                </h2>
                <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed">
                  Rajasthani miniature paintings are among the most famous art forms of India, known for their intricate details, vibrant colors, and themes of royal processions, hunting scenes, and Hindu epics. The major schools include Mewar, Marwar, Hadoti, and Dhundar, each with distinct styles. These paintings often feature bold colors, fine brushwork, and elaborate ornamentation, depicting scenes from the life of Lord Krishna, Ragamala series, and royal portraits.
                </p>
              </div>
            </div>
          </div>
          
          {/* Blue Pottery Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Blue Pottery
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Jaipur's blue pottery is a unique craft that originated in Persia and was brought to India by Mughal invaders. Made from a special dough of quartz stone powder, powdered glass, Multani mitti, borax, and gum, it is the only pottery in the world that is not made from clay. The distinctive blue color comes from cobalt oxide, and the designs often feature Persian-inspired floral and geometric patterns. Items include vases, plates, and tiles, all with a distinctive turquoise blue glaze.
            </p>
          </div>
          
          {/* Second Image */}
          <div className="mb-12 flex justify-center">
            <img 
              src="/rj2.jpg" 
              alt="Rajasthan Art 2" 
              className="w-[400px] h-[300px] object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23A2FF9C%22%2F%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%20fill%3D%22%23000%22%3ERajasthan%20Art%202%3C%2Ftext%3E%3C%2Fsvg%3E';
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
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Textiles and Embroidery
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Rajasthan is famous for its tie-dye (Bandhani) fabrics, block printing (Sanganeri and Bagru prints), and gota patti work. The traditional Rajasthani embroidery styles include Zari, Zardosi, Gota, and Phulkari. The region is also known for its vibrant leheriya (wave-patterned) and mothra (checkered) tie-dye fabrics. Each region has its specialty, like the famous Kota Doria fabrics from Kota and the fine muslin from Chanderi.
            </p>
          </div>
          
          {/* Jewelry Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Jewelry and Gem Cutting
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Jaipur is known as the 'Pink City' and is a major center for jewelry making and gem cutting. The city's jewelers are famous for their kundan and meenakari work, where precious stones are set in gold and decorated with enamel work. The traditional Rajasthani jewelry includes the borla (maang tikka), rakhdi (head ornament), and bajuband (armlet), often featuring intricate designs with precious and semi-precious stones.
            </p>
          </div>
          
          {/* Puppetry Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Puppetry and Folk Art
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Kathputli (puppetry) is a traditional form of entertainment in Rajasthan, where puppeteers use string puppets to narrate folk tales and legends. The puppets are made from wood, cotton, and cloth, and are colorfully dressed in traditional Rajasthani attire. The state is also known for its Phad paintings, which are large cloth scrolls painted with vegetable colors, depicting the life of local deities and heroes, particularly Pabuji and Devnarayan.
            </p>
          </div>
          
          {/* Architecture Section */}
          <div className="mb-12">
            <h2 className="font-instrument-serif text-[32px] text-black mb-4">
              Architecture and Stone Carving
            </h2>
            <p className="font-instrument-serif text-[18px] text-gray-800 leading-relaxed max-w-4xl">
              Rajasthan's architecture is a blend of Rajput and Mughal styles, featuring intricate jali work, chhatris (domed pavilions), and havelis (mansions) with frescoed walls. The state is famous for its stepwells (baoris), forts, and palaces made from pink sandstone and white marble. The stone carving tradition is most evident in the Dilwara Temples of Mount Abu, known for their exquisite marble carvings, and the intricate jharokhas (overhanging balconies) of Jaisalmer's havelis.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
