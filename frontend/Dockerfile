FROM archlinux:latest AS builder

RUN pacman -Syu --noconfirm yarn

WORKDIR /build
# install dependencies
COPY ./editor/package.json /build/
COPY ./editor/yarn.lock /build/
RUN yarn install

# build app
COPY ./editor /build/
RUN yarn build



FROM ubuntu

ENV TZ=Europe/Warsaw
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
#Lets install NGINX
RUN apt-get -y update && apt -y install nginx

#lets expose port 80
EXPOSE 80/tcp
CMD /usr/sbin/nginx && tail -f /dev/null

# let's copy the build
RUN mkdir /www
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /build/build /www/editor/

