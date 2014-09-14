import java.io.IOException;


public class outsourced {
public void writeNotUsed1(int[][] o) throws IOException{
		
		for(int i=0;i<o.length;i++){
			int[] t = o[i];
			if(t[0] == 0 && t[1] == 0){
				
			}else{
				if(i>0){
					out.write(", ");
				}
				out.write("[" + t[0] + ", " + t[1] + "]");
			}
		}
		close();
	}
	

public void writeNotUsed2(int[][] o) throws IOException {
	for(int i=0;i<o.length;i++){
		int[] t = o[i];

		if(i>0){
			out.write(", ");
		}
		String s = "[";
		for(int j = 0;j<t.length;j++){
			if(t[j] > 0){
				if(j>0){
					s+= ", ";
				}
				s+= t[j];
			}
		}
		s+="]";
//		System.out.println(s);
		out.write(s);
	}
	close();
}


public void redPixelsNotUsed(String varName, int[][] o) throws IOException {
	out.newLine();
	out.write("var "+ varName+ "StartLine = [");
	for(int i=0;i<o.length;i++){
		int[] t = o[i];

		if(i>0){
			out.write(", ");
		}
		String s = "[";
		for(int j = 0;j<t.length;j++){
				if(j>0){
					s+= ", ";
				}
				s+= t[j];
		}
		s+="]";
//		System.out.println(s);
		out.write(s);
	}
	out.write("];");
}


}
