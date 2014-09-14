import java.io.*;

public class FileWrite {

	private FileWriter fstream;
	private BufferedWriter out;

	public FileWrite() throws IOException {
		// fstream = new FileWriter("/Users/anna/lightcontrol/public/javascripts/obstacles.js");
		fstream = new FileWriter("C:/Users/anna/Documents/Uni/5. Semester/Projekt/lightcontrol/public/javascripts/obstacles.js");
		out = new BufferedWriter(fstream);

	}

	public void writeObstacles(String varName, int[][] o) throws IOException {
		out.newLine();
		out.write("var " + varName + "Obstacles = [");
		for (int i = 0; i < o.length; i++) {
			int[] t = o[i];

			if (i > 0) {
				out.write(", ");
			}
			String s = "[";
			for (int j = 0; j < t.length; j++) {
				if (j > 0) {
					s += ", ";
				}
				s += t[j];
			}
			s += "]";
			out.write(s);
		}
		out.write("];");

	}

	public void close() throws IOException {
		System.out.println("closing");

		out.close();
		fstream.close();
	}

	public void writeRedPixels(String varName, int[] array) throws IOException {
		out.newLine();
		out.write("var " + varName + "StartLine = {");
		String s = "xStart: " + array[0] + ", xEnd: " + array[1] + ", y: " + array[2];
		out.write(s);
		out.write("};");
	}
}