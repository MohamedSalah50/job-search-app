#1-)nodejs
FROM node:24

#2-)folder
WORKDIR /app

# 3-)package.json package-lock.json
COPY package*.json ./

# 4-)install
RUN npm install

# 5-)copy
COPY . .

# 6-)run    
CMD ["npm", "run", "start:dev"]
