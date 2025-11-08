import React, { useState } from "react";
import { StyleSheet } from "react-native";
import PostComponent from "./post_releated/PostComponent";
import TopOfPost from "./post_releated/TopOfPost";
import AppText from "../config/AppText";
import { useTheme } from "../config/ThemeContext";
import PostMenu from "./post_releated/PostMenu";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function SuggestionCard({
  type,
  userId,
  details,
  title,
  suggestionId,
  date,
  userImage,
  userName,
}) {
  const { theme } = useTheme();
  const [isPostMenu, setIsPostMenu] = useState(false);

  return (
    <>
      <PostComponent style={styles.container}>
        <TopOfPost
          date={formatDate(date)}
          image={userImage}
          userId={userId}
          isMine={false}
          name={userName}
          onPressThree={()=>setIsPostMenu(true)}
        />
        <AppText style={[styles.text, { color: theme.purple }]}>
          <AppText style={styles.bold}>Type: </AppText>
          {type}
        </AppText>
        <AppText style={[styles.text, { color: theme.green }]}>
          <AppText style={styles.bold}>Title: </AppText>
          {title}
        </AppText>
        <AppText style={[styles.text, { color: theme.main_text }]}>
          <AppText style={styles.bold}>Details: </AppText>
          {details}
        </AppText>
      </PostComponent>

      <PostMenu
        isMine={false}
        isVisible={isPostMenu}
        onClose={() => setIsPostMenu(false)}
        postId={suggestionId}
        isSuggestion
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingBottom: 30,
  },
  text: {
    fontSize: 18,
  },
  bold: {
    fontWeight: "bold",
  },
});

export default SuggestionCard;
