.PHONY: dev build start db-init docker-build docker-run clean

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

db-init:
	npm run db:init

install:
	npm install

docker-build:
	docker build -t insecure-pharmacy .

docker-run:
	docker run -p 3000:3000 insecure-pharmacy

docker-dev:
	docker-compose -f docker/docker-compose.dev.yml up

clean:
	rm -rf apps/backend/dist apps/frontend/dist apps/backend/database/pharmacy.db
