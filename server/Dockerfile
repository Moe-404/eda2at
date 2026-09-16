FROM node:18-alpine

# LibreOffice provides the headless 'soffice' binary used to convert
# uploaded Word documents (books/articles) to PDF for the reader.
RUN apk add --no-cache libreoffice

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
