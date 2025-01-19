import React, { createContext, useContext, useState } from "react";
import { ClassificationGrade } from "@/types/model";
import { ChildContainerProps } from "@/types";

interface ClassificationContextProps {
    selectedClassificationGrade: ClassificationGrade | undefined;
    setSelectedClassificationGrade: (grade: ClassificationGrade | undefined) => void;
}

const ClassificationContext = createContext<ClassificationContextProps | undefined>(undefined);

export const ClassificationGradeProvider = ({ children }: ChildContainerProps) => {
    const [selectedClassificationGrade, setSelectedClassificationGrade] = useState<ClassificationGrade | undefined>(undefined);
    return (
        <ClassificationContext.Provider value={{ selectedClassificationGrade, setSelectedClassificationGrade }}>
            {children}
        </ClassificationContext.Provider>
    );
};

export const useClassificationGrade = () => {
    const context = useContext(ClassificationContext);
    if (!context) throw new Error("useClassificationGrade must be used within a ClassificationGradeProvider");
    return context;
};
