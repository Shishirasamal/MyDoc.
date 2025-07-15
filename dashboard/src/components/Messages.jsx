import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";
import axios from "axios";



const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/message/getall",
          { withCredentials: true }
        );
        setMessages(data.messages);
      } catch (error) {
        console.log(error.response?.data?.message || "Error fetching messages");
      }
    };
    fetchMessages();
  }, []);

  const handleDelete = (id) => {
    // Remove message locally (frontend only)
    setMessages((prev) => prev.filter((msg) => msg._id !== id));
    toast.success("Message removed from view.");
  };

  if (!isAuthenticated) return <Navigate to={"/login"} />;

  return (
    <section className="page messages">
      <h1>MESSAGE</h1>
      <div className="banner">
        {messages.length > 0 ? (
          messages.map((element) => (
            <div className="card" key={element._id}>
              <div className="details">
                <button
                  onClick={() => handleDelete(element._id)}
                  style={{
                    float: "right",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  title="Delete Message" className="delete-button"
                >
                  <AiFillDelete color="red" size={20} />
                </button>
                <p>
                  First Name: <span>{element.firstName}</span>
                </p>
                <p>
                  Last Name: <span>{element.lastName}</span>
                </p>
                <p>
                  Email: <span>{element.email}</span>
                </p>
                <p>
                  Phone: <span>{element.phone}</span>
                </p>
                <p>
                  Message: <span>{element.message}</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <h1>No Messages!</h1>
        )}
      </div>
    </section>
  );
};

export default Messages;