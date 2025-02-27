#!/bin/bash

# Function to generate a colored square SVG
generate_svg() {
    cat > "icon.svg" << EOF
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#4285f4"/>
    <text x="256" y="256" font-family="Arial" font-size="280" fill="white" text-anchor="middle" dominant-baseline="central">A</text>
</svg>
EOF
}

# Generate SVG
generate_svg

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    exit 1
fi

# Generate PNG icons in different sizes
sizes=(16 32 48 128 512)
for size in "${sizes[@]}"; do
    convert -background none -size ${size}x${size} icon.svg "icon-${size}.png"
done

# Clean up SVG
rm icon.svg

echo "Icons generated successfully!"
