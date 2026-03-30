#!/bin/bash
# Download all Houzz-hosted images for self-hosting
# Run from: ~/Desktop/stoneburner-interior-designs/

mkdir -p images

echo "Downloading Stoneburner Interior Designs images from Houzz CDN..."

# Riverstone - Living Room (hero + portfolio)
curl -sL "https://st.hzcdn.com/fimgs/b3d18818026d795e_7325-w1200-h800-b0-p0---.jpg" -o images/riverstone-living.jpg
echo "✓ riverstone-living.jpg"

# Royal Harbor - Kitchen (hero + portfolio)
curl -sL "https://st.hzcdn.com/fimgs/99c138450fef1f03_7321-w1200-h800-b0-p0---.jpg" -o images/royal-harbor-kitchen.jpg
echo "✓ royal-harbor-kitchen.jpg"

# Estero - Remodel (hero + portfolio)
curl -sL "https://st.hzcdn.com/fimgs/8cd133df09a2e035_0312-w1200-h800-b0-p0---.jpg" -o images/estero-remodel.jpg
echo "✓ estero-remodel.jpg"

# Shadowood - Kitchen Remodel (portfolio + B&A before)
curl -sL "https://st.hzcdn.com/fimgs/ca718d9e0b85b689_3419-w800-h600-b0-p0---.jpg" -o images/shadowood-kitchen.jpg
echo "✓ shadowood-kitchen.jpg"

# Beach Condo - Living (portfolio)
curl -sL "https://st.hzcdn.com/fimgs/d3211ea70f9b0a50_6241-w800-h600-b0-p0---.jpg" -o images/beach-condo-living.jpg
echo "✓ beach-condo-living.jpg"

# Bayfront - Entry (portfolio)
curl -sL "https://st.hzcdn.com/simgs/28618b4e0f3668c0_14-9415/home-design.jpg" -o images/bayfront-entry.jpg
echo "✓ bayfront-entry.jpg"

# Bayfront - Living Room (portfolio + project card)
curl -sL "https://st.hzcdn.com/simgs/8f71b0ba089a403c_9-4720/home-design.jpg" -o images/bayfront-living.jpg
echo "✓ bayfront-living.jpg"

# Bayfront - Bedroom (portfolio)
curl -sL "https://st.hzcdn.com/simgs/b911d9d7089a4042_9-4721/home-design.jpg" -o images/bayfront-bedroom.jpg
echo "✓ bayfront-bedroom.jpg"

# Bayfront - Kitchen (portfolio + B&A after + vision board)
curl -sL "https://st.hzcdn.com/simgs/db11ee88089a4048_9-4722/home-design.jpg" -o images/bayfront-kitchen.jpg
echo "✓ bayfront-kitchen.jpg"

# Bayfront - Dining (portfolio)
curl -sL "https://st.hzcdn.com/simgs/1da143cd089a404e_9-4727/home-design.jpg" -o images/bayfront-dining.jpg
echo "✓ bayfront-dining.jpg"

# Bayfront - View 2 (portfolio)
curl -sL "https://st.hzcdn.com/simgs/2b31dae3089b7f14_14-9021/home-design.jpg" -o images/bayfront-view2.jpg
echo "✓ bayfront-view2.jpg"

# Bayfront - Exterior (portfolio)
curl -sL "https://st.hzcdn.com/simgs/4881299d0f3668bc_14-9415/home-design.jpg" -o images/bayfront-exterior.jpg
echo "✓ bayfront-exterior.jpg"

# Suzanne portrait (about section)
curl -sL "https://st.hzcdn.com/simgs/36c14a59002c19d1_9-2929/image.jpg" -o images/suzanne-portrait.jpg
echo "✓ suzanne-portrait.jpg"

echo ""
echo "Done! Downloaded 13 images to ./images/"
echo ""
ls -lh images/
