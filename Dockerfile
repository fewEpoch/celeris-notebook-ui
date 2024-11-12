FROM node:lts as dependencies
WORKDIR /celeris-frontend
COPY package.json package.json ./
COPY package-lock.json package-lock.json ./
COPY tsconfig.json tsconfig.json ./
#TODO: Ideally we shouldn't have to install dev dependencies, but @vidify/ package references fail wituout this.
#RUN npm install --omit=dev
RUN npm install

FROM node:lts as builder
WORKDIR /celeris-frontend
COPY . ./
COPY --from=dependencies /celeris-frontend/node_modules ./node_modules
RUN rm -rf ./.next
RUN npm run build

FROM node:lts as runner
WORKDIR /celeris-frontend
ENV NODE_ENV production
COPY --from=builder /celeris-frontend/node_modules ./node_modules
COPY --from=builder /celeris-frontend/.next ./.next
COPY . ./

EXPOSE 3000
CMD ["npm", "start"]
