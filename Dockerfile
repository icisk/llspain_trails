FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
# TODO: is it possible to use a version string like 9.x as outlined in the README.md!?
RUN corepack prepare pnpm@9.5.0 --activate

COPY . /app
WORKDIR /app
#make sure dist and modules do not exist before building
RUN rm -f -R node_modules && rm -f -R dist
RUN pnpm install
# option disabled as build is failing atm
# should be enabled in production deployment image build
# RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:alpine3.19
# copy nginx config
#COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
# TODO: check if default nginx conf is working
# copy build
COPY --from=base /app/dist/www /usr/share/nginx/html

USER root
# TODO: Check for non-root nginx base image
## add permissions for nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

## switch to non-root user
USER nginx

# can be used to adjust config files before starting
#COPY docker/bootstrap.sh /bootstrap.sh
#CMD ["sh", "/bootstrap.sh"]
#EXPOSE 8080
# PORT should be 80 by default...
