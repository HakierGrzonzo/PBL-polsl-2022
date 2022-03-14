FROM ubuntu

ENV TZ=Europe/Warsaw
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
#Lets install NGINX
RUN apt-get -y update && apt -y install nginx

#lets expose port 80
EXPOSE 80/tcp
CMD /usr/sbin/nginx && tail -f /dev/null
COPY ./nginx.conf /etc/nginx/nginx.conf

