FROM --platform=linux/amd64 openjdk:21
LABEL authors="ropold"
EXPOSE 8080
COPY backend/target/memoryhub.jar memoryhub.jar
ENTRYPOINT ["java", "-jar", "memoryhub.jar"]